using EnglishCentral.Application.Features.Academic.CourseCategories.Commands.CreateCourseCategory;
using EnglishCentral.Application.Features.Academic.CourseCategories.Commands.DeleteCourseCategory;
using EnglishCentral.Application.Features.Academic.CourseCategories.Commands.UpdateCourseCategory;
using EnglishCentral.Application.Features.Academic.CourseCategories.Queries.GetCourseCategories;
using EnglishCentral.Application.Features.Academic.CourseCategories.Queries.GetCourseCategoryById;
using EnglishCentral.Application.Features.Academic.Courses.Commands.CreateCourse;
using EnglishCentral.Application.Features.Academic.Courses.Commands.DeleteCourse;
using EnglishCentral.Application.Features.Academic.Courses.Commands.UpdateCourse;
using EnglishCentral.Application.Features.Academic.Courses.Queries.GetCourseById;
using EnglishCentral.Application.Features.Academic.Courses.Queries.GetCourses;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin
{
    [Route("api/admin/academic/course-categories")]
    [ApiController]
    public class CourseCategoriesController : AdminBaseController
    {
        private readonly IMediator _mediator;
        public CourseCategoriesController(IMediator mediator) => _mediator = mediator;

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.CourseCategoryRead)]
        public async Task<IActionResult> GetList([FromQuery] GetCourseCategoriesQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.CourseCategoryRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetCourseCategoryByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.CourseCategoryCreate)]
        public async Task<IActionResult> Create(CreateCourseCategoryCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.CourseCategoryUpdate)]
        public async Task<IActionResult> Update(long id, UpdateCourseCategoryCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:long}/delete")]
        [HasPermission(SystemPermissions.CourseCategoryDelete)]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteCourseCategoryCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }

    [Route("api/admin/academic/courses")]
    [ApiController]
    public class CoursesController : AdminBaseController
    {
        private readonly IMediator _mediator;
        public CoursesController(IMediator mediator) => _mediator = mediator;

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.CourseRead)]
        public async Task<IActionResult> GetList([FromQuery] GetCoursesQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.CourseRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetCourseByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.CourseCreate)]
        public async Task<IActionResult> Create(CreateCourseCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.CourseUpdate)]
        public async Task<IActionResult> Update(long id, UpdateCourseCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:long}/delete")]
        [HasPermission(SystemPermissions.CourseDelete)]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteCourseCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
