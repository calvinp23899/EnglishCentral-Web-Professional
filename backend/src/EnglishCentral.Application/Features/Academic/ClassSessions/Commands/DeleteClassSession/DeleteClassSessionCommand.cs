using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.ClassSessions.Commands.DeleteClassSession
{
    public record DeleteClassSessionCommand(long Id) : IRequest<Result<bool>>;
}
