using EnglishCentral.Application.Features.Academic.Enrollments.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Enrollments.Queries.GetEnrollmentById
{
    public class GetEnrollmentByIdQueryHandler : IRequestHandler<GetEnrollmentByIdQuery, Result<EnrollmentResponse>>
    {
        private readonly IAcademicRepository<Enrollment> _repository;

        public GetEnrollmentByIdQueryHandler(IAcademicRepository<Enrollment> repository)
        {
            _repository = repository;
        }

        public async Task<Result<EnrollmentResponse>> Handle(GetEnrollmentByIdQuery request, CancellationToken ct)
        {
            var enrollment = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
            return enrollment is null
                ? Result<EnrollmentResponse>.Failure("Enrollment is not found.", 404)
                : Result<EnrollmentResponse>.Success(enrollment.ToResponse());
        }
    }
}
