using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTemplates.Queries.GetExamTemplateById
{
    public record GetExamTemplateByIdQuery(long Id) : IRequest<Result<ExamTemplateResponse>>;
}
