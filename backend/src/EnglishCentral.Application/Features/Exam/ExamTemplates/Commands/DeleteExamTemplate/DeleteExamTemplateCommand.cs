using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTemplates.Commands.DeleteExamTemplate
{
    public record DeleteExamTemplateCommand(long Id) : IRequest<Result<bool>>;
}
