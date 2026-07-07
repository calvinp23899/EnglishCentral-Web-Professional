using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Features.Exam.ExamAttempts.Services;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Commands.SubmitExamAttempt
{
    public class SubmitExamAttemptCommandHandler : IRequestHandler<SubmitExamAttemptCommand, Result<ExamAttemptResponse>>
    {
        private readonly IExamReadRepository _readRepository;

        public SubmitExamAttemptCommandHandler(IExamReadRepository readRepository)
        {
            _readRepository = readRepository;
        }

        public async Task<Result<ExamAttemptResponse>> Handle(SubmitExamAttemptCommand request, CancellationToken ct)
        {
            var attempt = await _readRepository.GetAttemptForSubmitAsync(request.AttemptId, ct);

            if (attempt is null)
                return Result<ExamAttemptResponse>.Failure("Exam attempt is not found.", 404);

            if (attempt.Status is not EExamAttemptStatus.InProgress)
                return Result<ExamAttemptResponse>.Failure("Only in-progress attempt can be submitted.", 400);

            ExamAttemptScoringService.ScoreAttempt(attempt, DateTimeOffset.UtcNow);

            return Result<ExamAttemptResponse>.Success(attempt.ToResponse());
        }
    }
}
