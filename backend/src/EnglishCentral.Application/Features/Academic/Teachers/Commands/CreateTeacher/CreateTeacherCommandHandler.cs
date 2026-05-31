using EnglishCentral.Application.Features.Academic.Teachers.DTOs;
using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Academic.ITeacher;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Teachers.Commands.CreateTeacher
{
    public class CreateTeacherCommandHandler : IRequestHandler<CreateTeacherCommand, Result<TeacherResponse>>
    {
        private readonly ITeacherRepository _teacherRepository;
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IPasswordService _passwordService;
        private readonly ICodeGenerator _codeGeneratorService;

        public CreateTeacherCommandHandler(
            ITeacherRepository teacherRepository,
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IPasswordService passwordService,
            ICodeGenerator codeGeneratorService)
        {
            _teacherRepository = teacherRepository;
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _passwordService = passwordService;
            _codeGeneratorService = codeGeneratorService;
        }

        public async Task<Result<TeacherResponse>> Handle(CreateTeacherCommand request, CancellationToken ct)
        {
            var teacherCode = $"ET-{_codeGeneratorService.GenerateCode()}";
            var existedTeacherCode = await _teacherRepository.GetByTeacherCodeAsync(teacherCode, ct);
            if (existedTeacherCode is not null)
            {
                return Result<TeacherResponse>.Failure("Teacher code is already exists.", 409);
            }
            var accountResult = await ValidateOrCreateAccountAsync(request, ct);
            if (!accountResult.IsSuccess || accountResult.Data is null)
            {
                return Result<TeacherResponse>.Failure(accountResult.Error!, accountResult.StatusCode);
            }
            var teacher = new Teacher
            {
                PublicId = Guid.NewGuid(),
                TeacherCode = teacherCode,
                FullName = request.FullName.Trim(),
                Email = request.Email?.Trim(),
                PhoneNumber = request.PhoneNumber?.Trim(),
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                Address = request.Address?.Trim(),
                NationalId = request.NationalId?.Trim(),
                NationalIdIssuedDate = request.NationalIdIssuedDate,
                NationalIdIssuedPlace = request.NationalIdIssuedPlace?.Trim(),
                Specialization = request.Specialization?.Trim(),
                Bio = request.Bio?.Trim(),
                Degree = request.Degree?.Trim(),
                YearsOfExperience = request.YearsOfExperience,
                CertificationsJson = request.Certifications,
                HireDate = request.HireDate,
                ContractType = request.ContractType,
                ContractEndDate = request.ContractEndDate,
                Status = request.Status,
                SalaryType = request.SalaryType,
                BaseSalary = request.BaseSalary,
                HourlyRate = request.HourlyRate,
                BankAccountNumber = request.BankAccountNumber?.Trim(),
                BankName = request.BankName?.Trim(),
                TaxCode = request.TaxCode?.Trim(),
                User = accountResult.Data,
                CreatedAt = DateTimeOffset.UtcNow
            };
            await _teacherRepository.AddAsync(teacher, ct);
            return Result<TeacherResponse>.Success(teacher.ToResponse(), 201);
        }

        private async Task<Result<User>> ValidateOrCreateAccountAsync(CreateTeacherCommand request, CancellationToken ct)
        {
            return request.IsAccountExists
                ? await ValidateAccountAsync(request, ct)
                : await CreateAccountAsync(request, ct);
        }

        private async Task<Result<User>> ValidateAccountAsync(CreateTeacherCommand request, CancellationToken ct)
        {
            var accountUserId = request.Account.UserId!.Value;

            var user = await _userRepository.GetByIdWithRolesAsync(accountUserId, ct);
            if (user is null)
            {
                return Result<User>.Failure("User account not found.", 404);
            }

            var alreadyLinked = await _teacherRepository.ExistsByUserIdAsync(accountUserId, ct);
            if (alreadyLinked)
            {
                return Result<User>.Failure("This user account is already linked to another teacher.", 409);
            }
            var teacherRole = await _roleRepository.GetByNameAsync(request.Account.Role, ct);
            if (teacherRole is null)
            {
                return Result<User>.Failure($"{request.Account.Role} role is not found.", 500);
            }
            user.UserRoles.Add(new UserRole
            {
                RoleId = teacherRole.Id,
                User = user
            });
            return Result<User>.Success(user);
        }

        private async Task<Result<User>> CreateAccountAsync(CreateTeacherCommand request, CancellationToken ct)
        {
            var email = request.Account.Email!.Trim();

            var emailExists = await _userRepository.IsEmailExistsAsync(email, ct);
            if (emailExists)
            {
                return Result<User>.Failure("Email is already in use.", 409);
            }

            var teacherRole = await _roleRepository.GetByNameAsync(request.Account.Role, ct);
            if (teacherRole is null)
            {
                return Result<User>.Failure($"{request.Account.Role} role is not found.", 500);
            }

            var user = new User
            {
                PublicId = Guid.NewGuid(),
                FullName = request.Account.FullName!.Trim(),
                Email = email,
                PhoneNumber = request.Account.PhoneNumber?.Trim(),
                PasswordHash = _passwordService.Hash(request.Account.Password!),
                IsActive = true,
                EmailConfirmed = false,
                CreatedAt = DateTimeOffset.UtcNow
            };

            user.UserRoles.Add(new UserRole
            {
                RoleId = teacherRole.Id,
                User = user
            });

            await _userRepository.AddAsync(user, ct);

            return Result<User>.Success(user);
        }
    }
}
