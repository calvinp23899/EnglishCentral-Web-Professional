using EnglishCentral.Application.Features.Academic.Classes.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Classes.Queries.GetClassById
{
    public record GetClassByIdQuery(long Id) : IRequest<Result<ClassResponse>>;
}
