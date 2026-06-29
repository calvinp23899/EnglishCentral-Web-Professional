using EnglishCentral.Application.Features.Finance.Summaries.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Summaries.Queries.GetBillingSummary
{
    public record GetBillingSummaryQuery(long? EnrollmentId = null, long? StudentId = null) : IRequest<Result<BillingSummaryResponse>>;

    public class GetBillingSummaryQueryValidator : AbstractValidator<GetBillingSummaryQuery>
    {
        public GetBillingSummaryQueryValidator()
        {
            RuleFor(x => x.EnrollmentId).GreaterThan(0).When(x => x.EnrollmentId.HasValue);
            RuleFor(x => x.StudentId).GreaterThan(0).When(x => x.StudentId.HasValue);
            RuleFor(x => x).Must(x => x.EnrollmentId.HasValue || x.StudentId.HasValue)
                .WithMessage("EnrollmentId or StudentId is required.");
        }
    }
}
