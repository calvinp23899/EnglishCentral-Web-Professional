using EnglishCentral.Application.Features.Academic.Teachers.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Teachers.Queries.GetTeacherById
{
    public record GetTeacherByIdQuery(
        long TeacherId
    ) : IRequest<Result<TeacherResponse>>;
}
