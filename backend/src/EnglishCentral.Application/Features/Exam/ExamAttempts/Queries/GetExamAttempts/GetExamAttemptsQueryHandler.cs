using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Queries.GetExamAttempts
{
    public class GetExamAttemptsQueryHandler : IRequestHandler<GetExamAttemptsQuery, Result<PagedResult<ExamAttemptResponse>>>
    {
        private readonly IExamReadRepository _readRepository;

        public GetExamAttemptsQueryHandler(IExamReadRepository readRepository)
        {
            _readRepository = readRepository;
        }

        public async Task<Result<PagedResult<ExamAttemptResponse>>> Handle(GetExamAttemptsQuery request, CancellationToken ct)
        {
            var attempts = await _readRepository.GetAttemptsAsync(
                request.Page,
                request.PageSize,
                request.ExamVersionId,
                request.StudentId,
                request.Status,
                request.Keyword,
                request.IsDescending,
                ct);

            return Result<PagedResult<ExamAttemptResponse>>.Success(
                PagedResult<ExamAttemptResponse>.Create(
                    attempts.Items.Select(x => x.ToResponse()).ToList(),
                    attempts.Page,
                    attempts.PageSize,
                    attempts.TotalItems));
        }
    }
}
