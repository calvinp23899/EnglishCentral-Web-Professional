using EnglishCentral.Application.Features.Academic.Teachers.Commands.CreateTeacher;
using EnglishCentral.Application.Features.Academic.Teachers.Commands.DeleteTeacher;
using EnglishCentral.Application.Features.Academic.Teachers.Commands.UpdateTeacher;
using EnglishCentral.Application.Features.Academic.Teachers.Queries.GetTeacher;
using EnglishCentral.Application.Features.Academic.Teachers.Queries.GetTeacherById;
using EnglishCentral.Contracts.Requests.Academic.Teacher;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin
{
    [Route("api/admin/academic/teachers")]
    [ApiController]
    public class TeachersController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public TeachersController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.TeacherRead)]
        public async Task<IActionResult> GetTeachers([FromQuery] TeacherFilterRequest request, CancellationToken ct)
        {
            var query = new GetTeachersQuery
            {
                Page = request.Page,
                PageSize = request.PageSize,
                Keyword = request.Keyword,
                SortBy = request.SortBy,
                IsDescending = request.IsDescending,
                Status = request.Status,
                Date = request.HireDate
            };
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.TeacherRead)]
        public async Task<IActionResult> GetTeacherById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetTeacherByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.TeacherCreate)]
        public async Task<IActionResult> CreateTeacher(CreateTeacherRequest request, CancellationToken ct)
        {
            var command = new CreateTeacherCommand(
                request.FullName,
                request.Email,
                request.PhoneNumber,
                request.DateOfBirth,
                request.Gender,
                request.Address,
                request.NationalId,
                request.NationalIdIssuedDate,
                request.NationalIdIssuedPlace,
                request.Specialization,
                request.Bio,
                request.Degree,
                request.YearsOfExperience,
                request.Certifications,
                request.HireDate,
                request.ContractType,
                request.ContractEndDate,
                request.Status,
                request.SalaryType,
                request.BaseSalary,
                request.HourlyRate,
                request.BankAccountNumber,
                request.BankName,
                request.TaxCode,
                request.IsAccountExists,
                new TeacherAccountDto(
                    request.Account.UserId,
                    request.Account.Email,
                    request.Account.PhoneNumber,
                    request.Account.FullName,
                    request.Account.Password));
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.TeacherUpdate)]
        public async Task<IActionResult> UpdateTeacher(long id, UpdateTeacherRequest request, CancellationToken ct)
        {
            var command = new UpdateTeacherCommand(
                id,
                request.FullName,
                request.Email,
                request.PhoneNumber,
                request.DateOfBirth,
                request.Gender,
                request.Address,
                request.NationalId,
                request.NationalIdIssuedDate,
                request.NationalIdIssuedPlace,
                request.Specialization,
                request.Bio,
                request.Degree,
                request.YearsOfExperience,
                request.Certifications,
                request.HireDate,
                request.ContractType,
                request.ContractEndDate,
                request.Status,
                request.SalaryType,
                request.BaseSalary,
                request.HourlyRate,
                request.BankAccountNumber,
                request.BankName,
                request.TaxCode);
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:long}/delete")]
        [HasPermission(SystemPermissions.TeacherDelete)]
        public async Task<IActionResult> DeleteTeacher(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteTeacherCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
