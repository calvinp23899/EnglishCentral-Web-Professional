using EnglishCentral.Application.Features.Academic.Teachers.DTOs;
using EnglishCentral.Application.Interfaces.Academic.ITeacher;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Teachers.Commands.UpdateTeacher
{
    public class UpdateTeacherCommandHandler : IRequestHandler<UpdateTeacherCommand, Result<TeacherResponse>>
    {
        private readonly ITeacherRepository _repo;

        public UpdateTeacherCommandHandler(ITeacherRepository repo)
        {
            _repo = repo;
        }

        public async Task<Result<TeacherResponse>> Handle(UpdateTeacherCommand request, CancellationToken ct)
        {
            var teacher = await _repo.GetByIdAsync(
                    request.TeacherId,
                    ct);

            if (teacher is null)
            {
                return Result<TeacherResponse>
                    .Failure(
                        "Teacher not found",
                        404);
            }

            teacher.FullName = request.FullName;
            teacher.Email = request.Email;
            teacher.PhoneNumber = request.PhoneNumber;
            teacher.DateOfBirth = request.DateOfBirth;
            teacher.Gender = request.Gender;
            teacher.Address = request.Address;
            teacher.NationalId = request.NationalId;
            teacher.NationalIdIssuedDate = request.NationalIdIssuedDate;
            teacher.NationalIdIssuedPlace = request.NationalIdIssuedPlace;
            teacher.Specialization = request.Specialization;
            teacher.Bio = request.Bio;
            teacher.Degree = request.Degree;
            teacher.YearsOfExperience = request.YearsOfExperience;
            teacher.CertificationsJson = request.Certifications;
            teacher.HireDate = request.HireDate;
            teacher.ContractType = request.ContractType;
            teacher.ContractEndDate = request.ContractEndDate;
            teacher.Status = request.Status;
            teacher.SalaryType = request.SalaryType;
            teacher.BaseSalary = request.BaseSalary;
            teacher.HourlyRate = request.HourlyRate;
            teacher.BankAccountNumber = request.BankAccountNumber;
            teacher.BankName = request.BankName;
            teacher.TaxCode = request.TaxCode;

            return Result<TeacherResponse>
                .Success(
                    teacher.ToResponse());
        }
    }
}
