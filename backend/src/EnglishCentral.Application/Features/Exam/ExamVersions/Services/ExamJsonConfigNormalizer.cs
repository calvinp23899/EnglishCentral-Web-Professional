using System.Text.Json;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Services
{
    public static class ExamJsonConfigNormalizer
    {
        public static string? NormalizeToString(object? value)
        {
            if (value is null)
                return null;

            if (value is string stringValue)
                return string.IsNullOrWhiteSpace(stringValue) ? null : stringValue;

            if (value is JsonElement jsonElement)
            {
                return jsonElement.ValueKind switch
                {
                    JsonValueKind.Null or JsonValueKind.Undefined => null,
                    JsonValueKind.String => string.IsNullOrWhiteSpace(jsonElement.GetString()) ? null : jsonElement.GetString(),
                    _ => jsonElement.GetRawText()
                };
            }

            return JsonSerializer.Serialize(value);
        }
    }
}
