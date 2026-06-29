using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Queries.GetExamVersionById
{
    public class GetExamVersionByIdQueryHandler : IRequestHandler<GetExamVersionByIdQuery, Result<ExamVersionResponse>>
    {
        private readonly IExamReadRepository _readRepository;

        public GetExamVersionByIdQueryHandler(IExamReadRepository readRepository)
        {
            _readRepository = readRepository;
        }

        public async Task<Result<ExamVersionResponse>> Handle(GetExamVersionByIdQuery request, CancellationToken ct)
        {
            var version = await _readRepository.GetVersionWithContentAsync(request.Id, asNoTracking: true, ct);

            return version is null
                ? Result<ExamVersionResponse>.Failure("Exam version is not found.", 404)
                : Result<ExamVersionResponse>.Success(version.ToResponse());
        }
    }
}
