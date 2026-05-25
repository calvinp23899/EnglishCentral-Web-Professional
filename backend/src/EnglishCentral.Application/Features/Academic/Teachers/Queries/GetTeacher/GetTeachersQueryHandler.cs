using EnglishCentral.Application.Features.Academic.Students.DTOs;
using EnglishCentral.Application.Features.Academic.Teachers.DTOs;
using EnglishCentral.Application.Interfaces.Academic.ITeacher;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Teachers.Queries.GetTeacher
{
    public class GetTeachersQueryHandler
: IRequestHandler<
    GetTeachersQuery,
    Result<PagedResult<TeacherResponse>>>
    {
        private readonly ITeacherRepository _teacherRepository;

        public GetTeachersQueryHandler(ITeacherRepository teacherRepository)
        {
            _teacherRepository = teacherRepository;
        }

        public async Task<Result<PagedResult<TeacherResponse>>> Handle(GetTeachersQuery request, CancellationToken ct)
        {
            var result = await _teacherRepository.GetPagedAsync(
                    request.Page,
                    request.PageSize,
                    request.Keyword,
                    request.SortBy,
                    request.IsDescending,
                    request.Status,
                    request.Date,
                    ct);
            var items = result.Items
                    .Select(x => x.ToResponse())
                    .ToList();
            var pagedResult = PagedResult<TeacherResponse>.Create(
                     items,
                     request.Page,
                     request.PageSize,
                     result.TotalItems);

            return Result<PagedResult<TeacherResponse>>.Success(pagedResult);

        }
    }
}
