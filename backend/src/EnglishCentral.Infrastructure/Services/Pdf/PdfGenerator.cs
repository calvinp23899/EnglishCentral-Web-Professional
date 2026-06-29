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
                PdfTemplate.Invoice => GenerateInvoice((InvoicePdfModel)request.Model),
                PdfTemplate.PaymentPlanStatement => GeneratePaymentPlanStatement((PaymentPlanStatementPdfModel)request.Model),
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
                        column.Item().Element(c => ComposeHeader(c, model.Company, model.HeaderAmountLabel, model.HeaderAmount));
                        column.Item().PaddingVertical(28).Element(c => ComposeBillingInfo(c, model.BilledTo, model.InvoiceNumber, model.DateOfIssue));
                        column.Item().Element(c => ComposePaymentLineTable(c, model.Lines));
                        column.Item().PaddingTop(28).AlignRight().Width(250).Column(totals =>
                        {
                            AddTotalRow(totals, "SUBTOTAL", model.Subtotal);
                            AddTotalRow(totals, "TAX", model.Tax);
                            AddTotalRow(totals, "DISCOUNT", model.Discount);
                            AddTotalRow(totals, "TOTAL", model.Total, true);
                        });
                    });
                });
            }).GeneratePdf();
        }

        private static byte[] GenerateInvoice(InvoicePdfModel model)
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
                        column.Item().Element(c => ComposeHeader(c, model.Company, "Amount Due:", model.AmountDue));
                        column.Item().PaddingVertical(28).Element(c => ComposeInvoiceInfo(c, model));
                        column.Item().Element(c => ComposeInvoiceLineTable(c, model.Lines));
                        column.Item().PaddingTop(28).AlignRight().Width(250).Column(totals =>
                        {
                            AddTotalRow(totals, "SUBTOTAL", model.Subtotal);
                            AddTotalRow(totals, "TAX", model.Tax);
                            AddTotalRow(totals, "DISCOUNT", model.Discount);
                            AddTotalRow(totals, "TOTAL", model.Total);
                            AddTotalRow(totals, "PAID", model.Paid);
                            AddTotalRow(totals, "OUTSTANDING", model.Outstanding, true);
                        });
                    });
                });
            }).GeneratePdf();
        }

        private static byte[] GeneratePaymentPlanStatement(PaymentPlanStatementPdfModel model)
        {
            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(28);
                    page.DefaultTextStyle(x => x.FontSize(9).FontColor(PrimaryColor));

                    page.Content().Column(column =>
                    {
                        column.Item().Element(c => ComposeHeader(c, model.Company, "Outstanding:", model.OutstandingAmount));
                        column.Item().PaddingVertical(22).Element(c => ComposeStatementInfo(c, model));
                        column.Item().Element(c => ComposeStatementTable(c, model.Items));
                        column.Item().PaddingTop(26).AlignRight().Width(260).Column(totals =>
                        {
                            AddTotalRow(totals, "TOTAL", model.TotalAmount);
                            AddTotalRow(totals, "PAID", model.PaidAmount);
                            AddTotalRow(totals, "OUTSTANDING", model.OutstandingAmount, true);
                        });
                    });
                });
            }).GeneratePdf();
        }

        private static void ComposeHeader(IContainer container, CompanyPdfInfo company, string amountLabel, decimal amount)
        {
            container.Background(Colors.Grey.Lighten5).PaddingVertical(16).Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text(company.Name).FontSize(20).Bold().FontColor(PrimaryColor);
                    column.Item().PaddingTop(6).Text(company.Address).FontSize(11).FontColor(MutedTextColor);
                    column.Item().PaddingTop(4).Text(company.Email).FontSize(11).FontColor(MutedTextColor);
                });

                row.ConstantItem(210).AlignRight().Column(column =>
                {
                    column.Item().Text(amountLabel).FontSize(10).Bold().FontColor(PrimaryColor);
                    column.Item().PaddingTop(6).Text(FormatCurrency(amount))
                        .FontSize(20)
                        .Bold()
                        .FontColor(PrimaryColor);
                });
            });
        }

        private static void ComposeBillingInfo(IContainer container, BilledToPdfInfo billedTo, string invoiceNumber, DateOnly dateOfIssue)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("Billed to:").Bold().FontColor(PrimaryColor);
                    column.Item().PaddingTop(6).Text(billedTo.Name).FontColor(MutedTextColor);
                    if (!string.IsNullOrWhiteSpace(billedTo.Code))
                        column.Item().PaddingTop(4).Text(billedTo.Code).FontColor(MutedTextColor);
                    if (!string.IsNullOrWhiteSpace(billedTo.Email))
                        column.Item().PaddingTop(4).Text(billedTo.Email).FontColor(MutedTextColor);
                });

                row.ConstantItem(240).Column(column =>
                {
                    column.Item().Text("Invoice Number:").Bold().FontColor(PrimaryColor);
                    column.Item().PaddingTop(4).Text(invoiceNumber).FontColor(MutedTextColor);
                    column.Item().PaddingTop(8).Text("Date Of Issue:").Bold().FontColor(PrimaryColor);
                    column.Item().PaddingTop(4).Text(dateOfIssue.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)).FontColor(MutedTextColor);
                });
            });
        }

        private static void ComposeInvoiceInfo(IContainer container, InvoicePdfModel model)
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
                    column.Item().PaddingTop(8).Text("Due Date:").Bold().FontColor(PrimaryColor);
                    column.Item().PaddingTop(4).Text(model.DueDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)).FontColor(MutedTextColor);
                    column.Item().PaddingTop(8).Text("Status:").Bold().FontColor(PrimaryColor);
                    column.Item().PaddingTop(4).Text(model.Status.ToString()).FontColor(MutedTextColor);
                });
            });
        }

        private static void ComposeStatementInfo(IContainer container, PaymentPlanStatementPdfModel model)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("Student:").Bold().FontColor(PrimaryColor);
                    column.Item().PaddingTop(6).Text(model.BilledTo.Name).FontColor(MutedTextColor);
                    if (!string.IsNullOrWhiteSpace(model.BilledTo.Code))
                        column.Item().PaddingTop(4).Text(model.BilledTo.Code).FontColor(MutedTextColor);
                    if (!string.IsNullOrWhiteSpace(model.BilledTo.Email))
                        column.Item().PaddingTop(4).Text(model.BilledTo.Email).FontColor(MutedTextColor);
                });

                row.ConstantItem(270).Column(column =>
                {
                    column.Item().Text("Statement Number:").Bold().FontColor(PrimaryColor);
                    column.Item().PaddingTop(4).Text(model.StatementNumber).FontColor(MutedTextColor);
                    column.Item().PaddingTop(8).Text("Date Of Issue:").Bold().FontColor(PrimaryColor);
                    column.Item().PaddingTop(4).Text(model.DateOfIssue.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)).FontColor(MutedTextColor);
                    column.Item().PaddingTop(8).Text("Class:").Bold().FontColor(PrimaryColor);
                    column.Item().PaddingTop(4).Text(model.ClassName).FontColor(MutedTextColor);
                    column.Item().PaddingTop(8).Text("Plan:").Bold().FontColor(PrimaryColor);
                    column.Item().PaddingTop(4).Text(model.PlanType).FontColor(MutedTextColor);
                });
            });
        }

        private static void ComposePaymentLineTable(IContainer container, IReadOnlyCollection<PaymentInvoicePdfLine> lines)
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

                foreach (var line in lines)
                {
                    table.Cell().Element(BodyCell).Text(line.Quantity.ToString(CultureInfo.InvariantCulture));
                    table.Cell().Element(BodyCell).Text(line.Description).SemiBold();
                    table.Cell().Element(BodyCell).AlignRight().Text(FormatCurrency(line.Price)).SemiBold();
                    table.Cell().Element(BodyCell).AlignRight().Text(FormatCurrency(line.Amount)).SemiBold();
                }
            });
        }

        private static void ComposeInvoiceLineTable(IContainer container, IReadOnlyCollection<InvoicePdfLine> lines)
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

                foreach (var line in lines)
                {
                    table.Cell().Element(BodyCell).Text(line.Quantity.ToString(CultureInfo.InvariantCulture));
                    table.Cell().Element(BodyCell).Text(line.Description).SemiBold();
                    table.Cell().Element(BodyCell).AlignRight().Text(FormatCurrency(line.Price)).SemiBold();
                    table.Cell().Element(BodyCell).AlignRight().Text(FormatCurrency(line.Amount)).SemiBold();
                }
            });
        }

        private static void ComposeStatementTable(IContainer container, IReadOnlyCollection<PaymentPlanStatementItemPdfModel> items)
        {
            container.Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(35);
                    columns.RelativeColumn(1.2f);
                    columns.ConstantColumn(70);
                    columns.ConstantColumn(85);
                    columns.ConstantColumn(80);
                    columns.ConstantColumn(80);
                    columns.ConstantColumn(80);
                    columns.ConstantColumn(72);
                });

                table.Header(header =>
                {
                    header.Cell().Element(HeaderCell).Text("#").Bold();
                    header.Cell().Element(HeaderCell).Text("INSTALLMENT").Bold();
                    header.Cell().Element(HeaderCell).Text("DUE").Bold();
                    header.Cell().Element(HeaderCell).Text("INVOICE").Bold();
                    header.Cell().Element(HeaderCell).AlignRight().Text("AMOUNT").Bold();
                    header.Cell().Element(HeaderCell).AlignRight().Text("PAID").Bold();
                    header.Cell().Element(HeaderCell).AlignRight().Text("DUE").Bold();
                    header.Cell().Element(HeaderCell).Text("STATUS").Bold();
                });

                foreach (var item in items)
                {
                    table.Cell().Element(CompactBodyCell).Text(item.SequenceNumber.ToString(CultureInfo.InvariantCulture));
                    table.Cell().Element(CompactBodyCell).Text(item.Name).SemiBold();
                    table.Cell().Element(CompactBodyCell).Text(item.DueDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
                    table.Cell().Element(CompactBodyCell).Text(item.InvoiceNo);
                    table.Cell().Element(CompactBodyCell).AlignRight().Text(FormatCurrency(item.Amount));
                    table.Cell().Element(CompactBodyCell).AlignRight().Text(FormatCurrency(item.Paid));
                    table.Cell().Element(CompactBodyCell).AlignRight().Text(FormatCurrency(item.Outstanding));
                    table.Cell().Element(CompactBodyCell).Text(item.Status);
                }
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

        private static IContainer CompactBodyCell(IContainer container)
        {
            return container
                .BorderBottom(1)
                .BorderColor(BorderColor)
                .PaddingVertical(8)
                .PaddingHorizontal(3);
        }

        private static string FormatCurrency(decimal amount)
        {
            return $"{amount:#,##0.##} \u0111";
        }
    }
}
