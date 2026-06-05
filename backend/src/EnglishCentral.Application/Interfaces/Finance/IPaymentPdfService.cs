using EnglishCentral.Application.Interfaces.Documents;
using EnglishCentral.Shared.Results;

namespace EnglishCentral.Application.Interfaces.Finance
{
    public interface IPaymentPdfService
    {
        Task<Result<GeneratedPdf>> GeneratePaymentInvoicePdfAsync(long paymentId, CancellationToken ct = default);
    }
}
