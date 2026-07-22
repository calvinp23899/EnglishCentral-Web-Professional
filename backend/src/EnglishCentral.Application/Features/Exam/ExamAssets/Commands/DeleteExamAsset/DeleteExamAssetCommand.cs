using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAssets.Commands.DeleteExamAsset
{
    public record DeleteExamAssetCommand(long Id) : IRequest<Result<bool>>;
}
