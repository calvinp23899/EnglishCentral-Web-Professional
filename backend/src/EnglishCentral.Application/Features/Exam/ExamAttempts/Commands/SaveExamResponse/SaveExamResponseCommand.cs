using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Commands.SaveExamResponse
{
    public record SaveExamResponseCommand(
        long AttemptId,
        long? SectionAttemptId,
        long QuestionId,
        long? AnswerOptionId,
        string? AnswerText,
        string? AnswerJson) : IRequest<Result<ExamQuestionResponseResponse>>;
}
