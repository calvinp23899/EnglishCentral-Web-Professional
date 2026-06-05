using System.Globalization;
using EnglishCentral.Application.Interfaces.Documents;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EnglishCentral.Infrastructure.Services.Pdf
{
    public class PdfGenerator : IPdfGenerator
    {
        private const string PrimaryColor = "#123A5A";
        private const string MutedTextColor = "#5C6F86";
        private const string HeaderBackgroundColor = "#E6F2F4";
        private const string BorderColor = "#D9E4EA";

        static PdfGenerator()
        {
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public GeneratedPdf Generate(PdfGenerationRequest request)
        {
            var bytes = request.Template switch
            {
                PdfTemplate.PaymentInvoice => GeneratePaymentInvoice((PaymentInvoicePdfModel)request.Model),
                _ => throw new NotSupportedException($"PDF template '{request.Template}' is not supported.")
            };

            return new GeneratedPdf(request.FileName, "application/pdf", bytes);
        }

        private static byte[] GeneratePaymentInvoice(PaymentInvoicePdfModel model)
        {
            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(28);
                    page.DefaultTextStyle(x => x.FontSize(10).FontColor(PrimaryColor));

                    page.Content().Column(column =>
                    {
                        column.Item().Element(c => ComposeHeader(c, model));
                        column.Item().PaddingVertical(28).Element(c => ComposeBillingInfo(c, model));
                        column.Item().Element(c => ComposeLineTable(c, model));
                        column.Item().PaddingTop(28).AlignRight().Width(250).Element(c => ComposeTotals(c, model));
                    });
                });
            }).GeneratePdf();
        }

        private static void ComposeHeader(IContainer container, PaymentInvoicePdfModel model)
        {
            container.Background(Colors.Grey.Lighten5).PaddingVertical(16).Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text(model.Company.Name).FontSize(20).Bold().FontColor(PrimaryColor);
                    column.Item().PaddingTop(6).Text(model.Company.Address).FontSize(11).FontColor(MutedTextColor);
                    column.Item().PaddingTop(4).Text(model.Company.Email).FontSize(11).FontColor(MutedTextColor);
                });

                row.ConstantItem(190).AlignRight().Column(column =>
                {
                    column.Item().Text(model.HeaderAmountLabel).FontSize(10).Bold().FontColor(PrimaryColor);
                    column.Item().PaddingTop(6).Text(FormatCurrency(model.HeaderAmount))
                        .FontSize(20)
                        .Bold()
                        .FontColor(PrimaryColor);
                });
            });
        }

        private static void ComposeBillingInfo(IContainer container, PaymentInvoicePdfModel model)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("Billed to:").Bold().FontColor(PrimaryColor);
                    column.Item().PaddingTop(6).Text(model.BilledTo.Name).FontColor(MutedTextColor);

                    if (!string.IsNullOrWhiteSpace(model.BilledTo.Code))
                        column.Item().PaddingTop(4).Text(model.BilledTo.Code).FontColor(MutedTextColor);

                    if (!string.IsNullOrWhiteSpace(model.BilledTo.Email))
                        column.Item().PaddingTop(4).Text(model.BilledTo.Email).FontColor(MutedTextColor);
                });

                row.ConstantItem(240).Column(column =>
                {
                    column.Item().Text("Invoice Number:").Bold().FontColor(PrimaryColor);
                    column.Item().PaddingTop(4).Text(model.InvoiceNumber).FontColor(MutedTextColor);
                    column.Item().PaddingTop(8).Text("Date Of Issue:").Bold().FontColor(PrimaryColor);
                    column.Item().PaddingTop(4).Text(model.DateOfIssue.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)).FontColor(MutedTextColor);
                });
            });
        }

        private static void ComposeLineTable(IContainer container, PaymentInvoicePdfModel model)
        {
            container.Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(45);
                    columns.RelativeColumn();
                    columns.ConstantColumn(130);
                    columns.ConstantColumn(130);
                });

                table.Header(header =>
                {
                    header.Cell().Element(HeaderCell).Text("QTY").Bold();
                    header.Cell().Element(HeaderCell).Text("DESCRIPTION").Bold();
                    header.Cell().Element(HeaderCell).AlignRight().Text("PRICE").Bold();
                    header.Cell().Element(HeaderCell).AlignRight().Text("AMOUNT").Bold();
                });

                foreach (var line in model.Lines)
                {
                    table.Cell().Element(BodyCell).Text(line.Quantity.ToString(CultureInfo.InvariantCulture));
                    table.Cell().Element(BodyCell).Text(line.Description).SemiBold();
                    table.Cell().Element(BodyCell).AlignRight().Text(FormatCurrency(line.Price)).SemiBold();
                    table.Cell().Element(BodyCell).AlignRight().Text(FormatCurrency(line.Amount)).SemiBold();
                }
            });
        }

        private static void ComposeTotals(IContainer container, PaymentInvoicePdfModel model)
        {
            container.Column(column =>
            {
                AddTotalRow(column, "SUBTOTAL", model.Subtotal);
                AddTotalRow(column, "TAX", model.Tax);
                AddTotalRow(column, "DISCOUNT", model.Discount);
                AddTotalRow(column, "TOTAL", model.Total, true);
            });
        }

        private static void AddTotalRow(ColumnDescriptor column, string label, decimal amount, bool highlight = false)
        {
            column.Item().BorderBottom(1).BorderColor(BorderColor).PaddingVertical(10).Row(row =>
            {
                row.RelativeItem().Text(label).Bold().FontColor(PrimaryColor);
                row.ConstantItem(120).AlignRight().Text(FormatCurrency(amount))
                    .Bold()
                    .FontSize(highlight ? 12 : 11)
                    .FontColor(PrimaryColor);
            });
        }

        private static IContainer HeaderCell(IContainer container)
        {
            return container
                .Background(HeaderBackgroundColor)
                .PaddingVertical(10)
                .PaddingHorizontal(4)
                .DefaultTextStyle(x => x.FontColor(PrimaryColor));
        }

        private static IContainer BodyCell(IContainer container)
        {
            return container
                .BorderBottom(1)
                .BorderColor(BorderColor)
                .PaddingVertical(12)
                .PaddingHorizontal(4);
        }

        private static string FormatCurrency(decimal amount)
        {
            return $"{amount:#,##0.##} đ";
        }
    }
}
