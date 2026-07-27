using ClosedXML.Excel;

namespace EnglishCentral.Application.Common.Excel
{
    public sealed class ClosedXmlExcelExportService : IExcelExportService
    {
        private const string ExcelContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        public ExcelExportFile Export<T>(
            ExcelWorksheetTemplate<T> template,
            IReadOnlyCollection<T> rows,
            string fileName)
        {
            ArgumentNullException.ThrowIfNull(template);

            if (template.Columns.Count == 0)
                throw new ArgumentException("Excel template must define at least one column.", nameof(template));

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add(GetSafeSheetName(template.SheetName));

            var columnCount = template.Columns.Count;
            var titleRow = 1;
            var subtitleRow = string.IsNullOrWhiteSpace(template.Subtitle) ? 0 : 2;
            var generatedAtRow = subtitleRow == 0 ? 2 : 3;
            var headerRow = generatedAtRow + 2;
            var dataStartRow = headerRow + 1;

            ApplyDocumentHeader(worksheet, template, titleRow, subtitleRow, generatedAtRow, columnCount);
            ApplyTableHeader(worksheet, template, headerRow);
            WriteRows(worksheet, template, rows, dataStartRow);
            ApplyTableStyle(worksheet, rows.Count, headerRow, dataStartRow, columnCount);
            ApplyColumnLayout(worksheet, template, columnCount);

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);

            return new ExcelExportFile(stream.ToArray(), ExcelContentType, NormalizeFileName(fileName));
        }

        private static void ApplyDocumentHeader<T>(
            IXLWorksheet worksheet,
            ExcelWorksheetTemplate<T> template,
            int titleRow,
            int subtitleRow,
            int generatedAtRow,
            int columnCount)
        {
            var titleRange = worksheet.Range(titleRow, 1, titleRow, columnCount).Merge();
            titleRange.Value = template.Title;
            titleRange.Style.Font.Bold = true;
            titleRange.Style.Font.FontSize = 16;
            titleRange.Style.Font.FontColor = XLColor.FromHtml("#0F172A");
            titleRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#E0F2FE");
            titleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            titleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            worksheet.Row(titleRow).Height = 28;

            if (subtitleRow > 0)
            {
                var subtitleRange = worksheet.Range(subtitleRow, 1, subtitleRow, columnCount).Merge();
                subtitleRange.Value = template.Subtitle;
                subtitleRange.Style.Font.Italic = true;
                subtitleRange.Style.Font.FontColor = XLColor.FromHtml("#475569");
                subtitleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            }

            var generatedAtRange = worksheet.Range(generatedAtRow, 1, generatedAtRow, columnCount).Merge();
            generatedAtRange.Value = $"Generated at: {DateTimeOffset.Now:dd/MM/yyyy HH:mm}";
            generatedAtRange.Style.Font.FontColor = XLColor.FromHtml("#64748B");
            generatedAtRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
        }

        private static void ApplyTableHeader<T>(
            IXLWorksheet worksheet,
            ExcelWorksheetTemplate<T> template,
            int headerRow)
        {
            for (var columnIndex = 0; columnIndex < template.Columns.Count; columnIndex++)
            {
                var cell = worksheet.Cell(headerRow, columnIndex + 1);
                cell.Value = template.Columns[columnIndex].Header;
            }

            var headerRange = worksheet.Range(headerRow, 1, headerRow, template.Columns.Count);
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Font.FontColor = XLColor.White;
            headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#1F4E78");
            headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            headerRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            headerRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            headerRange.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
            worksheet.Row(headerRow).Height = 24;
        }

        private static void WriteRows<T>(
            IXLWorksheet worksheet,
            ExcelWorksheetTemplate<T> template,
            IReadOnlyCollection<T> rows,
            int dataStartRow)
        {
            var rowIndex = dataStartRow;

            foreach (var row in rows)
            {
                for (var columnIndex = 0; columnIndex < template.Columns.Count; columnIndex++)
                {
                    var column = template.Columns[columnIndex];
                    var cell = worksheet.Cell(rowIndex, columnIndex + 1);
                    SetCellValue(cell, column.ValueAccessor(row));

                    if (!string.IsNullOrWhiteSpace(column.NumberFormat))
                        cell.Style.NumberFormat.Format = column.NumberFormat;

                    if (column.WrapText)
                        cell.Style.Alignment.WrapText = true;
                }

                rowIndex++;
            }
        }

        private static void ApplyTableStyle(
            IXLWorksheet worksheet,
            int rowCount,
            int headerRow,
            int dataStartRow,
            int columnCount)
        {
            var lastRow = Math.Max(headerRow, dataStartRow + rowCount - 1);
            var tableRange = worksheet.Range(headerRow, 1, lastRow, columnCount);
            tableRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            tableRange.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
            tableRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

            if (rowCount > 0)
            {
                for (var rowIndex = dataStartRow; rowIndex <= lastRow; rowIndex++)
                {
                    if ((rowIndex - dataStartRow) % 2 == 1)
                        worksheet.Range(rowIndex, 1, rowIndex, columnCount).Style.Fill.BackgroundColor = XLColor.FromHtml("#F8FAFC");
                }
            }
            else
            {
                var emptyRange = worksheet.Range(dataStartRow, 1, dataStartRow, columnCount).Merge();
                emptyRange.Value = "No data";
                emptyRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                emptyRange.Style.Font.Italic = true;
                emptyRange.Style.Font.FontColor = XLColor.FromHtml("#64748B");
                lastRow = dataStartRow;
            }

            worksheet.Range(headerRow, 1, lastRow, columnCount).SetAutoFilter();
            worksheet.SheetView.FreezeRows(headerRow);
        }

        private static void ApplyColumnLayout<T>(
            IXLWorksheet worksheet,
            ExcelWorksheetTemplate<T> template,
            int columnCount)
        {
            worksheet.Columns(1, columnCount).AdjustToContents();

            for (var columnIndex = 0; columnIndex < template.Columns.Count; columnIndex++)
            {
                var column = template.Columns[columnIndex];
                var worksheetColumn = worksheet.Column(columnIndex + 1);

                if (column.Width.HasValue)
                {
                    worksheetColumn.Width = column.Width.Value;
                    continue;
                }

                worksheetColumn.Width = Math.Clamp(worksheetColumn.Width, 10, 35);
            }
        }

        private static void SetCellValue(IXLCell cell, object? value)
        {
            switch (value)
            {
                case null:
                    cell.Value = string.Empty;
                    break;
                case DateOnly date:
                    cell.Value = date.ToDateTime(TimeOnly.MinValue);
                    cell.Style.DateFormat.Format = "dd/MM/yyyy";
                    break;
                case DateTimeOffset dateTimeOffset:
                    cell.Value = dateTimeOffset.LocalDateTime;
                    cell.Style.DateFormat.Format = "dd/MM/yyyy HH:mm";
                    break;
                case DateTime dateTime:
                    cell.Value = dateTime;
                    cell.Style.DateFormat.Format = "dd/MM/yyyy HH:mm";
                    break;
                case decimal decimalValue:
                    cell.Value = decimalValue;
                    break;
                case double doubleValue:
                    cell.Value = doubleValue;
                    break;
                case float floatValue:
                    cell.Value = floatValue;
                    break;
                case int intValue:
                    cell.Value = intValue;
                    break;
                case long longValue:
                    cell.Value = longValue;
                    break;
                case bool boolValue:
                    cell.Value = boolValue ? "Yes" : "No";
                    break;
                default:
                    cell.Value = value.ToString();
                    break;
            }
        }

        private static string GetSafeSheetName(string sheetName)
        {
            var invalidChars = new[] { ':', '\\', '/', '?', '*', '[', ']' };
            var safeName = invalidChars.Aggregate(sheetName, (current, invalidChar) => current.Replace(invalidChar, '-')).Trim();

            if (string.IsNullOrWhiteSpace(safeName))
                return "Sheet1";

            return safeName.Length > 31 ? safeName[..31] : safeName;
        }

        private static string NormalizeFileName(string fileName)
        {
            return fileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase)
                ? fileName
                : $"{fileName}.xlsx";
        }
    }
}
