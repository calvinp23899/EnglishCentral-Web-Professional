using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAssets.Queries.GetExamAssetById
{
    public class GetExamAssetByIdQueryHandler : IRequestHandler<GetExamAssetByIdQuery, Result<ExamAssetResponse>>
    {
        private readonly IExamRepository<ExamAsset> _repository;

        public GetExamAssetByIdQueryHandler(IExamRepository<ExamAsset> repository)
        {
            _repository = repository;
        }

        public async Task<Result<ExamAssetResponse>> Handle(GetExamAssetByIdQuery request, CancellationToken ct)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
            return entity is null
                ? Result<ExamAssetResponse>.Failure("Exam asset is not found.", 404)
                : Result<ExamAssetResponse>.Success(entity.ToResponse());
        }
    }
}
