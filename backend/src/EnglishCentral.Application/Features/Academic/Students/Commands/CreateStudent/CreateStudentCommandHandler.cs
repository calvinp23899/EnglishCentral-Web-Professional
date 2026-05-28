using EnglishCentral.Application.Features.Academic.Students.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Shared.Common.Helpers;
using EnglishCentral.Shared.Constants;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Students.Commands.CreateStudent
{
    public class CreateStudentCommandHandler : IRequestHandler<CreateStudentCommand, Result<StudentResponse>>
    {
        private readonly IStudentRepository _studentRepository;
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IPasswordService _passwordService;
        public CreateStudentCommandHandler(
                IStudentRepository studentRepository,
                IUserRepository userRepository,
                IRoleRepository roleRepository,
                IPasswordService passwordService)
        {
            _studentRepository = studentRepository;
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _passwordService = passwordService;
        }

        public async Task<Result<StudentResponse>> Handle(CreateStudentCommand request, CancellationToken ct)
        {
            var resultAccount = await ValidateOrCreateAccountAsync(request, ct);
            if (resultAccount.Data == null)
            {
                return Result<StudentResponse>.Failure(
                    resultAccount.Error!,
                    resultAccount.StatusCode);
            }
            var newStdCode = CodeGeneratorHelper.GenerateWithPrefixAndTick("ST");
            var existedStudentCode = await _studentRepository.GetByStudentCodeAsync(newStdCode, ct);
            if (existedStudentCode is not null)
            {
                return Result<StudentResponse>.Failure("Student code already exists.", 409);
            }

            var student = new Student
            {
                PublicId = Guid.NewGuid(),
                StudentCode = newStdCode,
                User = resultAccount.Data,
                FullName = request.FullName.Trim(),
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                Email = request.Email?.Trim(),
                PhoneNumber = request.PhoneNumber?.Trim(),
                Address = request.Address?.Trim(),
                ParentName = request.ParentName?.Trim(),
                ParentPhoneNumber = request.ParentPhoneNumber?.Trim(),
                EnrollmentDate = request.EnrollmentDate,
                Status = request.Status,
                Notes = request.Notes?.Trim(),
                CreatedAt = DateTimeOffset.UtcNow
            };
            await _studentRepository.AddAsync(student, ct);
            return Result<StudentResponse>.Success(student.ToResponse(), 201);
        }

        private async Task<Result<User>> ValidateOrCreateAccountAsync(CreateStudentCommand request, CancellationToken ct)
        {
            if (request.IsAccountExists)
            {
                return await ValidateAccountAsync(request, ct);
            }

            return await CreateAccountAsync(request, ct);
        }
        private async Task<Result<User>> ValidateAccountAsync(CreateStudentCommand request, CancellationToken ct)
        {
            var accountUserId = request.Account.UserId!.Value;

            var user = await _userRepository.GetByIdAsync(accountUserId, ct);

            if (user is null)
            {
                throw new KeyNotFoundException("User is not found.");
            }

            var alreadyLinked = await _studentRepository.ExistsByUserIdAsync(accountUserId, ct);

            if (alreadyLinked)
            {
                throw new Exception("This account is already linked to another student.");
            }

            return Result<User>.Success(user);
        }

        private async Task<Result<User>> CreateAccountAsync(CreateStudentCommand request, CancellationToken ct)
        {
            var email = request.Email!.Trim();

            var emailExists = await _userRepository.IsEmailExistsAsync(email, ct);
            if (emailExists)
            {
                throw new Exception("Email already in use.");
            }

            var studentRole = await _roleRepository.GetByNameAsync(SystemRoles.Student, ct);
            if (studentRole is null)
            {
                throw new Exception("Default student role not found.");
            }

            var user = new User
            {
                PublicId = Guid.NewGuid(),
                FullName = request.FullName!.Trim(),
                Email = email,
                PhoneNumber = request.PhoneNumber?.Trim(),
                PasswordHash = _passwordService.Hash(request.Account.Password!),
                IsActive = true,
                EmailConfirmed = false,
                CreatedAt = DateTimeOffset.UtcNow
            };

            user.UserRoles.Add(new UserRole
            {
                RoleId = studentRole.Id,
                User = user
            });

            await _userRepository.AddAsync(user, ct);

            return Result<User>.Success(user);
        }
    }
}
