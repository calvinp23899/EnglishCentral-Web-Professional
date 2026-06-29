using EnglishCentral.Application.Features.Academic.Enrollments.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Enrollments.Queries.GetEnrollments
{
    public class GetEnrollmentsQueryHandler : IRequestHandler<GetEnrollmentsQuery, Result<PagedResult<EnrollmentResponse>>>
    {
        private readonly IAcademicRepository<Enrollment> _repository;

        public GetEnrollmentsQueryHandler(IAcademicRepository<Enrollment> repository)
        {
            _repository = repository;
        }

        public async Task<Result<PagedResult<EnrollmentResponse>>> Handle(GetEnrollmentsQuery request, CancellationToken ct)
        {
            var query = _repository.Query();
            if (request.StudentId.HasValue)
                query = query.Where(x => x.StudentId == request.StudentId.Value);
            if (request.ClassId.HasValue)
                query = query.Where(x => x.ClassId == request.ClassId.Value);
            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status.Value);

            query = request.IsDescending ? query.OrderByDescending(x => x.EnrolledAt) : query.OrderBy(x => x.EnrolledAt);

            var totalItems = await _repository.CountAsync(_ => query, ct);
            var enrollments = await _repository.ListAsync(_ => query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize), ct);
            var items = enrollments.Select(x => x.ToResponse()).ToList();
            return Result<PagedResult<EnrollmentResponse>>.Success(PagedResult<EnrollmentResponse>.Create(items, request.Page, request.PageSize, totalItems));
        }
    }
}
