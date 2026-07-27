namespace EnglishCentral.Application.Common.Excel
{
    public sealed record ExcelWorksheetTemplate<T>(
        string SheetName,
        string Title,
        IReadOnlyList<ExcelColumn<T>> Columns,
        string? Subtitle = null);
}
