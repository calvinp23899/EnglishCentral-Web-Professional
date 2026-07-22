namespace EnglishCentral.Application.Features.Exam.ExamListenings.DTOs
{
    public record ExamListeningAudioUploadResponse(
        string ObjectKey,
        string Url,
        string FileName,
        string ContentType,
        long Size);
}
