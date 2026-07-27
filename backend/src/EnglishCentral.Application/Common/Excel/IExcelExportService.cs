namespace EnglishCentral.Application.Common.Excel
{
    public interface IExcelExportService
    {
        ExcelExportFile Export<T>(
            ExcelWorksheetTemplate<T> template,
            IReadOnlyCollection<T> rows,
            string fileName);
    }
}
