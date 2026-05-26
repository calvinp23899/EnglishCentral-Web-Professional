using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Classes.Commands.DeleteClass
{
    public record DeleteClassCommand(long Id) : IRequest<Result<bool>>;
}
