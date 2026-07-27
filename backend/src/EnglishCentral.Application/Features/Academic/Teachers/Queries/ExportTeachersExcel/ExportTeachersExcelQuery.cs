using EnglishCentral.Application.Common.Excel;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Teachers.Queries.ExportTeachersExcel
{
    public record ExportTeachersExcelQuery : IRequest<Result<ExcelExportFile>>
    {
        public string? Keyword { get; init; }
        public EColumnSortGetTeacher? SortBy { get; init; }
        public EOrderSort OrderSort { get; init; } = EOrderSort.Descending;
        public ETeacherStatus? Status { get; init; }
        public DateOnly? Date { get; init; }
        public string? Role { get; init; }
    }

    public class ExportTeachersExcelQueryValidator : AbstractValidator<ExportTeachersExcelQuery>
    {
        public ExportTeachersExcelQueryValidator()
        {
            RuleFor(x => x.Keyword).MaximumLength(255);
            RuleFor(x => x.SortBy).IsInEnum().When(x => x.SortBy.HasValue);
            RuleFor(x => x.OrderSort).IsInEnum();
            RuleFor(x => x.Status).IsInEnum().When(x => x.Status.HasValue);
            RuleFor(x => x.Role).MaximumLength(100);
        }
    }
}
