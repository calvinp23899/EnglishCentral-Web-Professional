using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Commands.PublishExamVersion
{
    public record PublishExamVersionCommand(long Id) : IRequest<Result<ExamVersionResponse>>;
}
