using EnglishCentral.Domain.Entities.Academic;

namespace EnglishCentral.Application.Features.Academic.Teachers.DTOs
{
    public static class TeacherMapping
    {
        public static TeacherResponse ToResponse(this Teacher teacher)
        {
            return new TeacherResponse(
                teacher.PublicId,
                teacher.Id,
                teacher.TeacherCode,
                teacher.FullName,
                teacher.Email,
                teacher.PhoneNumber,
                teacher.DateOfBirth,
                teacher.Gender,
                teacher.Address,
                teacher.NationalId,
                teacher.NationalIdIssuedDate,
                teacher.NationalIdIssuedPlace,
                teacher.Specialization,
                teacher.Bio,
                teacher.Degree,
                teacher.YearsOfExperience,
                teacher.CertificationsJson,
                (DateOnly)teacher.HireDate,
                teacher.ContractType,
                teacher.ContractEndDate,
                teacher.Status,
                teacher.SalaryType,
                teacher.BaseSalary,
                teacher.HourlyRate,
                teacher.BankAccountNumber,
                teacher.BankName,
                teacher.TaxCode,
                teacher.CreatedAt,
                teacher.UpdatedAt,
                teacher.User is null
                    ? null
                    : new TeacherAccount(
                        teacher.User.Id,
                        teacher.User.Email,
                        teacher.User.IsActive)
            );
        }
    }
}
