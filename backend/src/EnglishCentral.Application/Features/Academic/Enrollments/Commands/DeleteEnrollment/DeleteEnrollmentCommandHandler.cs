using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Enrollments.Commands.DeleteEnrollment
{
    public class DeleteEnrollmentCommandHandler : IRequestHandler<DeleteEnrollmentCommand, Result<bool>>
    {
        private readonly IAcademicRepository<Enrollment> _repository;

        public DeleteEnrollmentCommandHandler(IAcademicRepository<Enrollment> repository)
        {
            _repository = repository;
        }

        public async Task<Result<bool>> Handle(DeleteEnrollmentCommand request, CancellationToken ct)
        {
            var enrollment = await _repository.GetByIdAsync(request.Id, ct);
            if (enrollment is null)
                return Result<bool>.Failure("Enrollment is not found.", 404);

            enrollment.IsDeleted = true;
            enrollment.DeletedAt = DateTimeOffset.UtcNow;
            enrollment.UpdatedAt = DateTimeOffset.UtcNow;
            return Result<bool>.Success(true);
        }
    }
}
