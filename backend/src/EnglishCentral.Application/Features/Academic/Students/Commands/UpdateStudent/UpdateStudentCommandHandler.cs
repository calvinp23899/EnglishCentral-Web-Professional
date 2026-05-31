using EnglishCentral.Application.Features.Academic.Students.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Students.Commands.UpdateStudent
{
    public class UpdateStudentCommandHandler : IRequestHandler<UpdateStudentCommand, Result<StudentResponse>>
    {
        private readonly IStudentRepository _studentRepository;
        private readonly IPasswordService _passwordService;

        public UpdateStudentCommandHandler(IStudentRepository studentRepository, IPasswordService passwordService)
        {
            _studentRepository = studentRepository;
            _passwordService = passwordService;
        }

        public async Task<Result<StudentResponse>> Handle(UpdateStudentCommand request, CancellationToken ct)
        {
            var student = await _studentRepository.GetByStudentIdIncludedAccountAsync(request.Id, false, ct);
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
            student.Status = request.Status;
            student.Notes = request.Notes?.Trim();
            if (request.NewPassword != null && student.User != null)
            {
                student.User.PasswordHash = _passwordService.Hash(request.NewPassword);
            }
            return Result<StudentResponse>.Success(student.ToResponse());
        }
    }
}
