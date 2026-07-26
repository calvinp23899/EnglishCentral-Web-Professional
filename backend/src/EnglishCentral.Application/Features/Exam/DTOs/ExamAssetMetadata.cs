using System.Text.Json;
using System.Text.Json.Serialization;
using EnglishCentral.Domain.Enums.Exam;

namespace EnglishCentral.Application.Features.Exam.DTOs
{
    public record ExamAssetMetadataResponse(
        EExamTypeUpload TypeExam,
        string? Speaker,
        int? TotalSection,
        List<ExamAssetStopPointResponse>? StopPoint);

    public record ExamAssetStopPointResponse(
        string? Title,
        string? StartTime,
        string? EndTime);

    public record ExamAssetMetadataNormalizeResult(
        bool IsSuccess,
        ExamAssetMetadataResponse? Metadata,
        string? NormalizedJson,
        string? Error);

    public static class ExamAssetMetadataHelper
    {
        private static readonly JsonSerializerOptions JsonOptions = CreateJsonOptions();

        public static ExamAssetMetadataNormalizeResult Normalize(string? metadataJson)
        {
            if (string.IsNullOrWhiteSpace(metadataJson))
            {
                var defaultMetadata = new ExamAssetMetadataResponse(EExamTypeUpload.OTHER, null, null, null);
                return Success(defaultMetadata);
            }

            ExamAssetMetadataInput? input;
            try
            {
                input = JsonSerializer.Deserialize<ExamAssetMetadataInput>(metadataJson, JsonOptions);
            }
            catch (JsonException ex)
            {
                return new ExamAssetMetadataNormalizeResult(false, null, null, $"MetadataJson is not valid JSON: {ex.Message}");
            }

            if (input is null)
                return new ExamAssetMetadataNormalizeResult(false, null, null, "MetadataJson is not valid.");

            if (!TryParseTypeExam(input.TypeExam, out var typeExam))
                return new ExamAssetMetadataNormalizeResult(false, null, null, "MetadataJson.TypeExam is invalid. Allowed values: IELTS, TOEIC, CAMBRIDGE, OTHER.");

            var metadata = new ExamAssetMetadataResponse(
                typeExam,
                NormalizeBlank(input.Speaker),
                input.TotalSection,
                input.StopPoint);

            return Success(metadata);
        }

        public static ExamAssetMetadataResponse? ToResponse(string? metadataJson)
        {
            if (string.IsNullOrWhiteSpace(metadataJson))
                return null;

            var result = Normalize(metadataJson);
            return result.IsSuccess ? result.Metadata : null;
        }

        public static string ToFolderSegment(EExamTypeUpload typeExam) =>
            typeExam == EExamTypeUpload.OTHER ? "Other" : typeExam.ToString();

        private static ExamAssetMetadataNormalizeResult Success(ExamAssetMetadataResponse metadata)
        {
            var normalizedJson = JsonSerializer.Serialize(metadata, JsonOptions);
            return new ExamAssetMetadataNormalizeResult(true, metadata, normalizedJson, null);
        }

        private static bool TryParseTypeExam(string? value, out EExamTypeUpload typeExam)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                typeExam = EExamTypeUpload.OTHER;
                return true;
            }

            return Enum.TryParse(value.Trim(), ignoreCase: true, out typeExam) && Enum.IsDefined(typeExam);
        }

        private static string? NormalizeBlank(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : value.Trim();

        private static JsonSerializerOptions CreateJsonOptions()
        {
            var options = new JsonSerializerOptions(JsonSerializerDefaults.Web)
            {
                PropertyNameCaseInsensitive = true,
                NumberHandling = JsonNumberHandling.AllowReadingFromString
            };
            options.Converters.Add(new JsonStringEnumConverter());
            return options;
        }

        private sealed class ExamAssetMetadataInput
        {
            public string? TypeExam { get; set; }

            public string? Speaker { get; set; }

            public int? TotalSection { get; set; }

            public List<ExamAssetStopPointResponse>? StopPoint { get; set; }
        }
    }
}
