using EnglishCentral.Application.Features.Academic.Students.Commands.CreateStudent;
using EnglishCentral.Application.Features.Academic.Students.Commands.DeleteStudent;
using EnglishCentral.Application.Features.Academic.Students.Commands.UpdateStudent;
using EnglishCentral.Application.Features.Academic.Students.Queries.GetStudentById;
using EnglishCentral.Application.Features.Academic.Students.Queries.GetStudents;
using EnglishCentral.Contracts.Requests.Academic.Student;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin
{
    [Route("api/admin/academic/students")]
    [ApiController]
    public class StudentsController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public StudentsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.StudentRead)]
        public async Task<IActionResult> GetStudents([FromQuery] StudentFilterRequest request, CancellationToken ct)
        {
            var query = new GetStudentsQuery
            {
                Page = request.Page,
                PageSize = request.PageSize,
                Keyword = request.Keyword,
                SortBy = request.SortBy,
                IsDescending = request.IsDescending,
                Status = request.Status.HasValue
                        ? (StudentStatus?)request.Status.Value
                        : null,
                Date = request.EnrollmentDate
            };
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{UserId:long}/get-by-id")]
        [HasPermission(SystemPermissions.StudentRead)]
        public async Task<IActionResult> GetStudentById(long UserId, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetStudentByIdQuery(UserId), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.StudentCreate)]
        public async Task<IActionResult> CreateStudent(CreateStudentRequest request, CancellationToken ct)
        {
            var command = new CreateStudentCommand(
                request.StudentCode,
                request.FullName,
                request.DateOfBirth,
                request.Gender,
                request.Email,
                request.PhoneNumber,
                request.Address,
                request.ParentName,
                request.ParentPhoneNumber,
                request.EnrollmentDate,
                request.Status,
                request.Notes,
                request.IsAccountExists,
                new StudentAccountDto(
                    request.Account.UserId,
                    request.Account.Email,
                    request.Account.PhoneNumber,
                    request.Account.FullName,
                    request.Account.Password
                )
            );

            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{Id:long}/update")]
        [HasPermission(SystemPermissions.StudentUpdate)]
        public async Task<IActionResult> UpdateStudent(long Id, UpdateStudentRequest request, CancellationToken ct)
        {
            var command = new UpdateStudentCommand(
                Id,
                request.FullName,
                request.DateOfBirth,
                request.Gender,
                request.Email,
                request.PhoneNumber,
                request.Address,
                request.ParentName,
                request.ParentPhoneNumber,
                request.Status,
                request.Notes
            );
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{Id:long}/delete")]
        [HasPermission(SystemPermissions.StudentDelete)]
        public async Task<IActionResult> DeleteStudent(long Id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteStudentCommand(Id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
