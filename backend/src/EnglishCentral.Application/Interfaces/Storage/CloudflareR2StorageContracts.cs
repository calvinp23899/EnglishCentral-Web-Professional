namespace EnglishCentral.Application.Interfaces.Storage
{
    public interface ICloudflareR2StorageService
    {
        Task<CloudflareR2UploadResult> UploadAsync(
            Stream fileStream,
            string objectKey,
            string contentType,
            CancellationToken ct);

        Task DeleteAsync(string objectKey, CancellationToken ct);
    }

    public record CloudflareR2UploadResult(
        string BucketName,
        string ObjectKey,
        string Url);
}
