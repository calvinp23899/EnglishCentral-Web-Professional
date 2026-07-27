namespace EnglishCentral.Application.Common.Excel
{
    public sealed record ExcelColumn<T>(
        string Header,
        Func<T, object?> ValueAccessor,
        double? Width = null,
        string? NumberFormat = null,
        bool WrapText = false);
}
