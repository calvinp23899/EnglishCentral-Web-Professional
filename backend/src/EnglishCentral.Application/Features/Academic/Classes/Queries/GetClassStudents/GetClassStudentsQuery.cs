using EnglishCentral.Application.Features.Academic.Classes.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Classes.Queries.GetClassStudents
{
    public record GetClassStudentsQuery(long ClassId)
        : IRequest<Result<List<ClassStudentResponse>>>;
}
