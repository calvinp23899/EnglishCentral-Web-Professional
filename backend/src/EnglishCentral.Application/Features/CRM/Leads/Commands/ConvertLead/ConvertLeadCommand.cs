using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.Leads.Commands.ConvertLead
{
    public record ConvertLeadCommand(
        long LeadId,
        long StudentId,
        long? EnrollmentId,
        long ConvertedByUserId,
        decimal? RevenueSnapshot,
        string? Note) : IRequest<Result<LeadConversionResponse>>;

    public class ConvertLeadCommandValidator : AbstractValidator<ConvertLeadCommand>
    {
        public ConvertLeadCommandValidator()
        {
            RuleFor(x => x.LeadId).GreaterThan(0);
            RuleFor(x => x.StudentId).GreaterThan(0);
            RuleFor(x => x.EnrollmentId).GreaterThan(0).When(x => x.EnrollmentId.HasValue);
            RuleFor(x => x.ConvertedByUserId).GreaterThan(0);
            RuleFor(x => x.RevenueSnapshot).GreaterThanOrEqualTo(0).When(x => x.RevenueSnapshot.HasValue);
            RuleFor(x => x.Note).MaximumLength(2000);
        }
    }
}
