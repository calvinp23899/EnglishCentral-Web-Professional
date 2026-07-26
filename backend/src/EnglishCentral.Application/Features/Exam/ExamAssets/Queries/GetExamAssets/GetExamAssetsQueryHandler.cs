using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAssets.Queries.GetExamAssets
{
    public class GetExamAssetsQueryHandler : IRequestHandler<GetExamAssetsQuery, Result<PagedResult<ExamAssetResponse>>>
    {
        private readonly IExamRepository<ExamAsset> _repository;

        public GetExamAssetsQueryHandler(IExamRepository<ExamAsset> repository)
        {
            _repository = repository;
        }

        public async Task<Result<PagedResult<ExamAssetResponse>>> Handle(GetExamAssetsQuery request, CancellationToken ct)
        {
            var query = _repository.Query();

            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                var keyword = request.Keyword.Trim().ToLower();
                query = query.Where(x =>
                    x.OriginalFileName.ToLower().Contains(keyword) ||
                    x.ObjectKey.ToLower().Contains(keyword) ||
                    x.PublicUrl.ToLower().Contains(keyword));
            }

            var assetTypes = (request.AssetTypes ?? [])
                .Concat(request.AssetType ?? [])
                .Distinct()
                .ToList();

            if (assetTypes.Count > 0)
                query = query.Where(x => assetTypes.Contains(x.AssetType));
            if (request.TypeExam.HasValue)
            {
                var typeExam = request.TypeExam.Value.ToString();
                query = query.Where(x => x.MetadataJson != null && x.MetadataJson.Contains($"\"typeExam\":\"{typeExam}\""));
            }
            if (request.Provider.HasValue)
                query = query.Where(x => x.Provider == request.Provider.Value);
            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status.Value);
            if (!string.IsNullOrWhiteSpace(request.ContentType))
            {
                var contentType = request.ContentType.Trim().ToLower();
                query = query.Where(x => x.ContentType.ToLower().Contains(contentType));
            }

            query = request.SortBy?.Trim().ToLowerInvariant() switch
            {
                "filename" => request.IsDescending ? query.OrderByDescending(x => x.OriginalFileName) : query.OrderBy(x => x.OriginalFileName),
                "filesize" => request.IsDescending ? query.OrderByDescending(x => x.FileSize) : query.OrderBy(x => x.FileSize),
                "assettype" => request.IsDescending ? query.OrderByDescending(x => x.AssetType) : query.OrderBy(x => x.AssetType),
                "status" => request.IsDescending ? query.OrderByDescending(x => x.Status) : query.OrderBy(x => x.Status),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            var totalItems = await _repository.CountAsync(_ => query, ct);
            var items = await _repository.ListAsync(_ => query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize), ct);
            return Result<PagedResult<ExamAssetResponse>>.Success(
                PagedResult<ExamAssetResponse>.Create(items.Select(x => x.ToResponse()).ToList(), request.Page, request.PageSize, totalItems));
        }
    }
}
