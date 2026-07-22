using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAssets.Queries.GetExamAssets
{
    public record GetExamAssetsQuery : IRequest<Result<PagedResult<ExamAssetResponse>>>
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public string? Keyword { get; init; }
        public EExamAssetType? AssetType { get; init; }
        public EExamAssetProvider? Provider { get; init; }
        public EExamAssetStatus? Status { get; init; }
        public string? ContentType { get; init; }
        public string? SortBy { get; init; }
        public bool IsDescending { get; init; } = true;
    }
}
