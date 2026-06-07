using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Queries.GetExamVersionById
{
    public record GetExamVersionByIdQuery(long Id) : IRequest<Result<ExamVersionResponse>>;
}
