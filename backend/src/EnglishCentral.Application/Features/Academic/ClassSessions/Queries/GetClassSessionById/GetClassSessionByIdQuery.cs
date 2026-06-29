using EnglishCentral.Application.Features.Academic.ClassSessions.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.ClassSessions.Queries.GetClassSessionById
{
    public record GetClassSessionByIdQuery(long Id) : IRequest<Result<ClassSessionResponse>>;
}
