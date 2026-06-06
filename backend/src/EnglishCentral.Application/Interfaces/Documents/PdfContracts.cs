namespace EnglishCentral.Application.Interfaces.Documents
{
    public enum PdfTemplate
    {
        PaymentInvoice = 1,
        Invoice = 2,
        PaymentPlanStatement = 3
    }

    public record PdfGenerationRequest(
        PdfTemplate Template,
        object Model,
        string FileName);

    public record GeneratedPdf(
        string FileName,
        string ContentType,
        byte[] Content);

    public interface IPdfGenerator
    {
        GeneratedPdf Generate(PdfGenerationRequest request);
    }
}
