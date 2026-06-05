namespace EnglishCentral.Application.Interfaces.Documents
{
    public record CompanyPdfInfo(
        string Name,
        string Address,
        string Email);

    public record BilledToPdfInfo(
        string Name,
        string? Code,
        string? Email);

    public record PaymentInvoicePdfLine(
        int Quantity,
        string Description,
        decimal Price,
        decimal Amount);

    public record PaymentInvoicePdfModel(
        CompanyPdfInfo Company,
        BilledToPdfInfo BilledTo,
        string InvoiceNumber,
        DateOnly DateOfIssue,
        string HeaderAmountLabel,
        decimal HeaderAmount,
        decimal Subtotal,
        decimal Tax,
        decimal Discount,
        decimal Total,
        IReadOnlyCollection<PaymentInvoicePdfLine> Lines);
}
