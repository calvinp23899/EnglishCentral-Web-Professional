using EnglishCentral.Application.Interfaces.Documents;
using EnglishCentral.Shared.Results;

namespace EnglishCentral.Application.Interfaces.Finance
{
    public interface IBillingPdfService
    {
        Task<Result<GeneratedPdf>> GenerateInvoicePdfAsync(long invoiceId, CancellationToken ct = default);
        Task<Result<GeneratedPdf>> GeneratePaymentPlanStatementPdfAsync(long paymentPlanId, CancellationToken ct = default);
    }
}
