using EnglishCentral.Application.Features.Academic.Students.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Students.Queries.GetStudents
{
    public class GetStudentsQueryHandler : IRequestHandler<GetStudentsQuery, Result<PagedResult<StudentResponse>>>
    {
        private readonly IStudentRepository _studentRepository;

        public GetStudentsQueryHandler(IStudentRepository studentRepository)
        {
            _studentRepository = studentRepository;
        }

        public async Task<Result<PagedResult<StudentResponse>>> Handle(GetStudentsQuery request, CancellationToken ct)
        {

            var result = await _studentRepository.GetPagedAsync(
                request.Page,
                request.PageSize,
                request.Keyword,
                request.SortBy,
                (bool)request.IsDescending,
                request.Status,
                request.Date,
                ct);

            var items = result.Items
                .Select(x => x.ToResponse())
                .ToList();

            var pagedResult = PagedResult<StudentResponse>.Create(
                items,
                request.Page,
                request.PageSize,
                result.TotalItems);

            return Result<PagedResult<StudentResponse>>.Success(pagedResult);
        }
    }
}
