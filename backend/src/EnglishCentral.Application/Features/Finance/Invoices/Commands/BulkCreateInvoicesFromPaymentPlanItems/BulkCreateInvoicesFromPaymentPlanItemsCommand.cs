using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Invoices.Commands.BulkCreateInvoicesFromPaymentPlanItems
{
    public record BulkCreateInvoicesFromPaymentPlanItemsCommand(
        long PaymentPlanId,
        IReadOnlyCollection<long> PaymentPlanItemIds,
        string? Notes) : IRequest<Result<BulkCreateInvoicesFromPaymentPlanItemsResponse>>;

    public record BulkCreateInvoicesFromPaymentPlanItemsResponse(
        long PaymentPlanId,
        long EnrollmentId,
        long StudentId,
        string? StudentName,
        long ClassId,
        string? ClassName,
        decimal TotalOutstandingAmount,
        int InvoiceCount,
        IReadOnlyCollection<BulkCreatedInvoiceItemResponse> Items,
        IReadOnlyCollection<BulkPaymentAllocationDraftResponse> AllocationDrafts);

    public record BulkCreatedInvoiceItemResponse(
        long PaymentPlanItemId,
        int SequenceNumber,
        string Name,
        DateOnly DueDate,
        decimal Amount,
        EPaymentPlanItemStatus PaymentPlanItemStatus,
        long InvoiceId,
        string InvoiceNo,
        EInvoiceStatus InvoiceStatus,
        decimal InvoiceOutstandingAmount,
        bool CreatedNewInvoice);

    public record BulkPaymentAllocationDraftResponse(
        long InvoiceId,
        decimal Amount);

    public class BulkCreateInvoicesFromPaymentPlanItemsCommandValidator
        : AbstractValidator<BulkCreateInvoicesFromPaymentPlanItemsCommand>
    {
        public BulkCreateInvoicesFromPaymentPlanItemsCommandValidator()
        {
            RuleFor(x => x.PaymentPlanId).GreaterThan(0);
            RuleFor(x => x.PaymentPlanItemIds).NotEmpty();
            RuleForEach(x => x.PaymentPlanItemIds).GreaterThan(0);
            RuleFor(x => x.PaymentPlanItemIds)
                .Must(ids => ids.Distinct().Count() == ids.Count)
                .When(x => x.PaymentPlanItemIds is not null)
                .WithMessage("Payment plan item ids cannot be duplicated.");
            RuleFor(x => x.Notes).MaximumLength(2000);
        }
    }
}
