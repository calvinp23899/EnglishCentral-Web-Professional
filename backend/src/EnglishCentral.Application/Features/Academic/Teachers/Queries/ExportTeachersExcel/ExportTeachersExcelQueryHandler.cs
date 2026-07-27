using EnglishCentral.Application.Common.Excel;
using EnglishCentral.Application.Features.Academic.Teachers.DTOs;
using EnglishCentral.Application.Interfaces.Academic.ITeacher;
using EnglishCentral.Shared.Common.Helpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Teachers.Queries.ExportTeachersExcel
{
    public class ExportTeachersExcelQueryHandler : IRequestHandler<ExportTeachersExcelQuery, Result<ExcelExportFile>>
    {
        private const string DateFormat = "dd/MM/yyyy";
        private const string DateTimeFormat = "dd/MM/yyyy HH:mm";
        private const string CurrencyFormat = "#,##0";

        private readonly ITeacherRepository _teacherRepository;
        private readonly IExcelExportService _excelExportService;

        public ExportTeachersExcelQueryHandler(
            ITeacherRepository teacherRepository,
            IExcelExportService excelExportService)
        {
            _teacherRepository = teacherRepository;
            _excelExportService = excelExportService;
        }

        public async Task<Result<ExcelExportFile>> Handle(ExportTeachersExcelQuery request, CancellationToken ct)
        {
            var teachers = await _teacherRepository.GetForExportAsync(
                request.Keyword,
                request.SortBy,
                request.OrderSort,
                request.Status,
                request.Date,
                request.Role,
                ct);

            var rows = teachers
                .Select((teacher, index) => new TeacherExcelRow(index + 1, teacher.ToResponse()))
                .ToList();

            var template = BuildTemplate(rows.Count);
            var file = _excelExportService.Export(template, rows, $"employees-{DateTimeOffset.Now:yyyyMMddHHmmss}.xlsx");

            return Result<ExcelExportFile>.Success(file);
        }

        private static ExcelWorksheetTemplate<TeacherExcelRow> BuildTemplate(int totalRows)
        {
            return new ExcelWorksheetTemplate<TeacherExcelRow>(
                SheetName: "Employees",
                Title: "DANH SÁCH NHÂN VIÊN",
                Subtitle: $"Tổng số: {totalRows}",
                Columns:
                [
                    new("STT", x => x.Index, 8),
                    new("Mã nhân viên", x => x.Teacher.TeacherCode, 16),
                    new("Họ tên", x => x.Teacher.FullName, 24),
                    new("Email", x => x.Teacher.Email, 28),
                    new("Số điện thoại", x => x.Teacher.PhoneNumber, 16),
                    new("Giới tính", x => x.Teacher.Gender.ToDescription(), 12),
                    new("Ngày sinh", x => x.Teacher.DateOfBirth, 14, DateFormat),
                    new("Địa chỉ", x => x.Teacher.Address, 30, WrapText: true),
                    new("CCCD/CMND", x => x.Teacher.NationalId, 18),
                    new("Ngày cấp", x => x.Teacher.NationalIdIssuedDate, 14, DateFormat),
                    new("Nơi cấp", x => x.Teacher.NationalIdIssuedPlace, 20),
                    new("Chuyên môn", x => x.Teacher.Specialization, 22),
                    new("Bằng cấp", x => x.Teacher.Degree, 18),
                    new("Kinh nghiệm", x => x.Teacher.YearsOfExperience, 14),
                    new("Chứng chỉ", x => JoinValues(x.Teacher.Certifications), 30, WrapText: true),
                    new("Ngày vào làm", x => x.Teacher.HireDate, 14, DateFormat),
                    new("Loại hợp đồng", x => x.Teacher.ContractType?.ToDescription(), 16),
                    new("Ngày hết hạn HĐ", x => x.Teacher.ContractEndDate, 16, DateFormat),
                    new("Trạng thái", x => x.Teacher.Status.ToDescription(), 14),
                    new("Loại lương", x => x.Teacher.SalaryType.ToDescription(), 14),
                    new("Lương cơ bản", x => x.Teacher.BaseSalary, 16, CurrencyFormat),
                    new("Lương giờ", x => x.Teacher.HourlyRate, 14, CurrencyFormat),
                    new("Ngân hàng", x => x.Teacher.BankName, 20),
                    new("Số tài khoản", x => x.Teacher.BankAccountNumber, 20),
                    new("Mã số thuế", x => x.Teacher.TaxCode, 16),
                    new("Vai trò", x => JoinValues(x.Teacher.RolesName), 20),
                    new("Tài khoản", x => x.Teacher.Account is null ? "Chưa liên kết" : x.Teacher.Account.IsActive ? "Đang hoạt động" : "Không hoạt động", 18),
                    new("Ngày tạo", x => x.Teacher.CreatedAt, 18, DateTimeFormat),
                    new("Ngày cập nhật", x => x.Teacher.UpdatedAt, 18, DateTimeFormat),
                ]);
        }

        private static string JoinValues(IEnumerable<string>? values)
        {
            return values is null ? string.Empty : string.Join(", ", values.Where(x => !string.IsNullOrWhiteSpace(x)));
        }

        private sealed record TeacherExcelRow(int Index, TeacherResponse Teacher);
    }
}
