using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Queries.GetExamAttemptById
{
    public class GetExamAttemptByIdQueryHandler : IRequestHandler<GetExamAttemptByIdQuery, Result<ExamAttemptResponse>>
    {
        private readonly IExamReadRepository _readRepository;

        public GetExamAttemptByIdQueryHandler(IExamReadRepository readRepository)
        {
            _readRepository = readRepository;
        }

        public async Task<Result<ExamAttemptResponse>> Handle(GetExamAttemptByIdQuery request, CancellationToken ct)
        {
            var attempt = await _readRepository.GetAttemptWithDetailsAsync(request.Id, asNoTracking: true, ct);

            return attempt is null
                ? Result<ExamAttemptResponse>.Failure("Exam attempt is not found.", 404)
                : Result<ExamAttemptResponse>.Success(attempt.ToResponse());
        }
    }
}
