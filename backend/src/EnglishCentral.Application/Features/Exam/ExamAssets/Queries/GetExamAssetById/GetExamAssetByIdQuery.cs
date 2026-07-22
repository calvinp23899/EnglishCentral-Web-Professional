using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAssets.Queries.GetExamAssetById
{
    public record GetExamAssetByIdQuery(long Id) : IRequest<Result<ExamAssetResponse>>;
}
