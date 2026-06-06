using EnglishCentral.Domain.Enums.Finance;

namespace EnglishCentral.Application.Interfaces.Documents
{
    public record InvoicePdfLine(
        int Quantity,
        string Description,
        decimal Price,
        decimal Amount);

    public record InvoicePdfModel(
        CompanyPdfInfo Company,
        BilledToPdfInfo BilledTo,
        string InvoiceNumber,
        DateOnly DateOfIssue,
        DateOnly DueDate,
        EInvoiceStatus Status,
        decimal AmountDue,
        decimal Subtotal,
        decimal Tax,
        decimal Discount,
        decimal Total,
        decimal Paid,
        decimal Outstanding,
        IReadOnlyCollection<InvoicePdfLine> Lines);

    public record PaymentPlanStatementItemPdfModel(
        int SequenceNumber,
        string Name,
        DateOnly DueDate,
        decimal Amount,
        string InvoiceNo,
        decimal Paid,
        decimal Outstanding,
        string Status);

    public record PaymentPlanStatementPdfModel(
        CompanyPdfInfo Company,
        BilledToPdfInfo BilledTo,
        string StatementNumber,
        DateOnly DateOfIssue,
        string ClassName,
        string PlanType,
        decimal TotalAmount,
        decimal PaidAmount,
        decimal OutstandingAmount,
        IReadOnlyCollection<PaymentPlanStatementItemPdfModel> Items);
}
