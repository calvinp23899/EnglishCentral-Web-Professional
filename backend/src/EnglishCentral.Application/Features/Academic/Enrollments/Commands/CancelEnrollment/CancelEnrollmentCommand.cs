using EnglishCentral.Application.Features.Academic.Enrollments.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Enrollments.Commands.CancelEnrollment
{
    public record CancelEnrollmentCommand(long Id, string? Reason) : IRequest<Result<EnrollmentResponse>>;

    public class CancelEnrollmentCommandValidator : AbstractValidator<CancelEnrollmentCommand>
    {
        public CancelEnrollmentCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Reason).MaximumLength(1000);
        }
    }
}
