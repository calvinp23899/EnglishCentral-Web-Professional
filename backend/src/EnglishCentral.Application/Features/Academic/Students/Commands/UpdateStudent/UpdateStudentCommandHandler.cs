using EnglishCentral.Application.Features.Academic.Students.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Students.Commands.UpdateStudent
{
    public class UpdateStudentCommandHandler
    : IRequestHandler<UpdateStudentCommand, Result<StudentResponse>>
    {
        private readonly IStudentRepository _studentRepository;

        public UpdateStudentCommandHandler(IStudentRepository studentRepository)
        {
            _studentRepository = studentRepository;
        }

        public async Task<Result<StudentResponse>> Handle(UpdateStudentCommand request, CancellationToken ct)
        {
            var student = await _studentRepository.GetByIdAsync(request.Id, ct);

            if (student is null)
            {
                return Result<StudentResponse>.Failure("Student is not found.", 404);
            }

            student.FullName = request.FullName.Trim();
            student.DateOfBirth = request.DateOfBirth;
            student.Gender = request.Gender;
            student.Email = request.Email?.Trim();
            student.PhoneNumber = request.PhoneNumber?.Trim();
            student.Address = request.Address?.Trim();
            student.ParentName = request.ParentName?.Trim();
            student.ParentPhoneNumber = request.ParentPhoneNumber?.Trim();
            //student.EnrollmentDate = request.EnrollmentDate;
            student.Status = request.Status;
            student.Notes = request.Notes?.Trim();
            student.UpdatedAt = DateTimeOffset.UtcNow;
            //student.UpdatedBy =

            return Result<StudentResponse>.Success(student.ToResponse());
        }
    }
}
