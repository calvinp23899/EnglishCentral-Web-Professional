using System.Globalization;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using EnglishCentral.Application.Interfaces.Storage;
using Microsoft.Extensions.Options;

namespace EnglishCentral.Infrastructure.Services.Storage
{
    public class CloudflareR2StorageService : ICloudflareR2StorageService
    {
        private const string Region = "auto";
        private const string Service = "s3";
        private const string EmptyPayloadHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
        private readonly HttpClient _httpClient;
        private readonly CloudflareR2Options _options;

        public CloudflareR2StorageService(HttpClient httpClient, IOptions<CloudflareR2Options> options)
        {
            _httpClient = httpClient;
            _options = options.Value;
        }

        public async Task<CloudflareR2UploadResult> UploadAsync(
            Stream fileStream,
            string objectKey,
            string contentType,
            CancellationToken ct)
        {
            ValidateOptions();

            objectKey = NormalizeObjectKey(objectKey);
            var bucketName = NormalizeObjectKey(_options.BucketName);
            var payload = await ReadPayloadAsync(fileStream, ct);
            var payloadHash = ToHexString(SHA256.HashData(payload));
            using var request = BuildSignedRequest(HttpMethod.Put, bucketName, objectKey, payloadHash);
            request.Content = new ByteArrayContent(payload);
            request.Content.Headers.ContentType = new MediaTypeHeaderValue(contentType);

            using var response = await _httpClient.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(ct);
                throw new InvalidOperationException($"Cloudflare R2 upload failed: {(int)response.StatusCode} {response.ReasonPhrase}. {body}");
            }

            return new CloudflareR2UploadResult(bucketName, objectKey, BuildPublicUrl(objectKey));
        }

        public async Task DeleteAsync(string objectKey, CancellationToken ct)
        {
            ValidateOptions();

            objectKey = NormalizeObjectKey(objectKey);
            var bucketName = NormalizeObjectKey(_options.BucketName);
            using var request = BuildSignedRequest(HttpMethod.Delete, bucketName, objectKey, EmptyPayloadHash);

            using var response = await _httpClient.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(ct);
                throw new InvalidOperationException($"Cloudflare R2 delete failed: {(int)response.StatusCode} {response.ReasonPhrase}. {body}");
            }
        }

        private HttpRequestMessage BuildSignedRequest(HttpMethod method, string bucketName, string objectKey, string payloadHash)
        {
            var now = DateTimeOffset.UtcNow;
            var amzDate = now.ToString("yyyyMMdd'T'HHmmss'Z'", CultureInfo.InvariantCulture);
            var dateStamp = now.ToString("yyyyMMdd", CultureInfo.InvariantCulture);
            var host = $"{_options.AccountId.Trim()}.r2.cloudflarestorage.com";
            var canonicalUri = $"/{EscapePath(bucketName)}/{EscapePath(objectKey)}";
            var requestUri = new Uri($"https://{host}{canonicalUri}");
            var request = new HttpRequestMessage(method, requestUri);

            request.Headers.TryAddWithoutValidation("x-amz-content-sha256", payloadHash);
            request.Headers.TryAddWithoutValidation("x-amz-date", amzDate);
            request.Headers.TryAddWithoutValidation("Authorization", BuildAuthorizationHeader(
                method.Method,
                host,
                canonicalUri,
                payloadHash,
                amzDate,
                dateStamp));

            return request;
        }

        private string BuildAuthorizationHeader(
            string method,
            string host,
            string canonicalUri,
            string payloadHash,
            string amzDate,
            string dateStamp)
        {
            const string signedHeaders = "host;x-amz-content-sha256;x-amz-date";
            var credentialScope = $"{dateStamp}/{Region}/{Service}/aws4_request";
            var canonicalHeaders = $"host:{host}\n" +
                                   $"x-amz-content-sha256:{payloadHash}\n" +
                                   $"x-amz-date:{amzDate}\n";

            var canonicalRequest = $"{method}\n{canonicalUri}\n\n{canonicalHeaders}\n{signedHeaders}\n{payloadHash}";
            var canonicalRequestHash = ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(canonicalRequest)));
            var stringToSign = $"AWS4-HMAC-SHA256\n{amzDate}\n{credentialScope}\n{canonicalRequestHash}";
            var signingKey = GetSignatureKey(_options.SecretKey, dateStamp, Region, Service);
            var signature = ToHexString(HmacSha256(signingKey, stringToSign));

            return $"AWS4-HMAC-SHA256 Credential={_options.AccessKey}/{credentialScope}, SignedHeaders={signedHeaders}, Signature={signature}";
        }

        private string BuildPublicUrl(string objectKey)
        {
            var publicUrl = _options.PublicUrl?.Trim();
            if (string.IsNullOrWhiteSpace(publicUrl))
            {
                publicUrl = $"https://{_options.AccountId.Trim()}.r2.cloudflarestorage.com/{NormalizeObjectKey(_options.BucketName)}";
            }

            return $"{publicUrl.TrimEnd('/')}/{EscapePath(objectKey)}";
        }

        private void ValidateOptions()
        {
            if (string.IsNullOrWhiteSpace(_options.AccountId))
                throw new InvalidOperationException("Cloudflare AccountId is not configured.");

            if (string.IsNullOrWhiteSpace(_options.AccessKey))
                throw new InvalidOperationException("Cloudflare AccessKey is not configured.");

            if (string.IsNullOrWhiteSpace(_options.SecretKey))
                throw new InvalidOperationException("Cloudflare SecretKey is not configured.");

            if (string.IsNullOrWhiteSpace(_options.BucketName))
                throw new InvalidOperationException("Cloudflare BucketName is not configured.");
        }

        private static async Task<byte[]> ReadPayloadAsync(Stream fileStream, CancellationToken ct)
        {
            if (fileStream.CanSeek)
                fileStream.Position = 0;

            using var memoryStream = new MemoryStream();
            await fileStream.CopyToAsync(memoryStream, ct);
            return memoryStream.ToArray();
        }

        private static string NormalizeObjectKey(string value)
        {
            return value.Replace('\\', '/').Trim().TrimStart('/').TrimEnd('/');
        }

        private static string EscapePath(string path)
        {
            return string.Join("/", path
                .Split('/', StringSplitOptions.RemoveEmptyEntries)
                .Select(Uri.EscapeDataString));
        }

        private static byte[] GetSignatureKey(string key, string dateStamp, string regionName, string serviceName)
        {
            var kDate = HmacSha256(Encoding.UTF8.GetBytes($"AWS4{key}"), dateStamp);
            var kRegion = HmacSha256(kDate, regionName);
            var kService = HmacSha256(kRegion, serviceName);
            return HmacSha256(kService, "aws4_request");
        }

        private static byte[] HmacSha256(byte[] key, string data)
        {
            using var hmac = new HMACSHA256(key);
            return hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        }

        private static string ToHexString(byte[] bytes)
        {
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }
    }
}
