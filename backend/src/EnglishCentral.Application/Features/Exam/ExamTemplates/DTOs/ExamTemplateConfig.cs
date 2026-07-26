using System.Text.Json;
using System.Text.Json.Serialization;

namespace EnglishCentral.Application.Features.Exam.ExamTemplates.DTOs
{
    public sealed class ExamTemplateConfig
    {
        public string? SourceLabel { get; init; }

        public string? Level { get; init; }

        public int? TotalParts { get; init; }

        [JsonExtensionData]
        public Dictionary<string, JsonElement>? ExtensionData { get; init; }
    }

    public static class ExamTemplateConfigJson
    {
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public static string? Serialize(ExamTemplateConfig? config)
        {
            return config is null ? null : JsonSerializer.Serialize(config, JsonOptions);
        }

        public static ExamTemplateConfig? Deserialize(string? configJson)
        {
            if (string.IsNullOrWhiteSpace(configJson))
                return null;

            try
            {
                return JsonSerializer.Deserialize<ExamTemplateConfig>(configJson, JsonOptions);
            }
            catch (JsonException)
            {
                return null;
            }
        }
    }
}
