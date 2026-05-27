using EnglishCentral.Application.Features.Academic.Students.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Students.Queries.GetStudentById
{
    public record GetStudentByIdQuery(long userId) : IRequest<Result<StudentResponse>>;
}
