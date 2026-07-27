namespace EnglishCentral.Application.Common.Excel
{
    public sealed record ExcelExportFile(
        byte[] Content,
        string ContentType,
        string FileName);
}
