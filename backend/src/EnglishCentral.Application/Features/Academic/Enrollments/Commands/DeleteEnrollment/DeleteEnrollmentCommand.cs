using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Enrollments.Commands.DeleteEnrollment
{
    public record DeleteEnrollmentCommand(long Id) : IRequest<Result<bool>>;
}
