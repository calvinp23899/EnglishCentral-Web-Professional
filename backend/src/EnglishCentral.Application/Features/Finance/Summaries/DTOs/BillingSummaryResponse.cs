namespace EnglishCentral.Application.Features.Finance.Summaries.DTOs
{
    public record BillingSummaryResponse(
        long? EnrollmentId,
        long? StudentId,
        decimal FinalAmount,
        decimal PaidAmount,
        decimal OutstandingAmount,
        int InvoiceCount,
        int OverdueInvoiceCount);
}
