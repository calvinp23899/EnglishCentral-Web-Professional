using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Queries.GetExamAttempts
{
    public record GetExamAttemptsQuery : IRequest<Result<PagedResult<ExamAttemptResponse>>>
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public long? ExamVersionId { get; init; }
        public long? StudentId { get; init; }
        public EExamAttemptStatus? Status { get; init; }
        public string? Keyword { get; init; }
        public bool IsDescending { get; init; } = true;
    }
}
