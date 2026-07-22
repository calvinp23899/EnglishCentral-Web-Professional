using EnglishCentral.Application.Features.Exam.ExamListenings.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamListenings.Commands.UploadExamListeningAudio
{
    public record UploadExamListeningAudioCommand(
        Stream FileStream,
        string FileName,
        string? ContentType,
        long Size) : IRequest<Result<ExamListeningAudioUploadResponse>>;
}
