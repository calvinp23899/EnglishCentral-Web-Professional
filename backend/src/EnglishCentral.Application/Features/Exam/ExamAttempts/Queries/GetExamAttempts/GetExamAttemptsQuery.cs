using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Queries.GetExamAttempts
{
    public record GetExamAttemptsQuery : IRequest<Result<PagedResult<ExamAttemptResponse>>>
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public long? ExamVersionId { get; init; }
        public long? StudentId { get; init; }
        public string? CandidateEmail { get; init; }
        public EExamAttemptMode? Mode { get; init; }
        public EExamAttemptStatus? Status { get; init; }
        public string? Keyword { get; init; }
        public bool IsDescending { get; init; } = true;
    }

    public class GetExamAttemptsQueryValidator : AbstractValidator<GetExamAttemptsQuery>
    {
        public GetExamAttemptsQueryValidator()
        {
            RuleFor(x => x.Page).GreaterThan(0);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
            RuleFor(x => x.ExamVersionId).GreaterThan(0).When(x => x.ExamVersionId.HasValue);
            RuleFor(x => x.StudentId).GreaterThan(0).When(x => x.StudentId.HasValue);
            RuleFor(x => x.Mode).IsInEnum().When(x => x.Mode.HasValue);
            RuleFor(x => x.Status).IsInEnum().When(x => x.Status.HasValue);
            RuleFor(x => x.CandidateEmail).MaximumLength(255);
            RuleFor(x => x.Keyword).MaximumLength(255);
        }
    }
}
