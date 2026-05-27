using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Invoices.Commands.CancelInvoice
{
    public class CancelInvoiceCommandHandler : IRequestHandler<CancelInvoiceCommand, Result<bool>>
    {
        private readonly IFinanceRepository<Invoice> _invoiceRepository;
        private readonly IFinanceRepository<EnrollmentPaymentPlanItem> _itemRepository;
        private readonly IFinanceRepository<BillingLedgerEntry> _ledgerRepository;

        public CancelInvoiceCommandHandler(IFinanceRepository<Invoice> invoiceRepository, IFinanceRepository<EnrollmentPaymentPlanItem> itemRepository, IFinanceRepository<BillingLedgerEntry> ledgerRepository)
        {
            _invoiceRepository = invoiceRepository;
            _itemRepository = itemRepository;
            _ledgerRepository = ledgerRepository;
        }

        public async Task<Result<bool>> Handle(CancelInvoiceCommand request, CancellationToken ct)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(request.Id, ct);
            if (invoice is null)
                return Result<bool>.Failure("Invoice is not found.", 404);
            if (invoice.PaidAmount > 0)
                return Result<bool>.Failure("Paid invoice cannot be cancelled. Cancel/refund payment first.", 400);

            invoice.Status = InvoiceStatus.Cancelled;
            invoice.UpdatedAt = DateTimeOffset.UtcNow;
            if (invoice.PaymentPlanItemId.HasValue)
            {
                var item = await _itemRepository.GetByIdAsync(invoice.PaymentPlanItemId.Value, ct);
                if (item is not null)
                {
                    item.Status = PaymentPlanItemStatus.Cancelled;
                    item.UpdatedAt = DateTimeOffset.UtcNow;
                }
            }

            await _ledgerRepository.AddAsync(new BillingLedgerEntry
            {
                EnrollmentId = invoice.EnrollmentId,
                InvoiceId = invoice.Id,
                Type = BillingLedgerEntryType.InvoiceCancelled,
                CreditAmount = invoice.OutstandingAmount,
                BalanceAfter = 0,
                OccurredAt = DateTimeOffset.UtcNow,
                Description = request.Reason?.Trim()
            }, ct);

            return Result<bool>.Success(true);
        }
    }
}
