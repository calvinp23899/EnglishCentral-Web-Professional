using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamReviews.Commands.ReviewExamAttempt
{
    public class ReviewExamAttemptCommandHandler : IRequestHandler<ReviewExamAttemptCommand, Result<ExamAttemptResponse>>
    {
        private readonly IExamRepository<ExamAttempt> _attemptRepository;
        private readonly IExamRepository<ExamReview> _reviewRepository;
        private readonly IExamReadRepository _readRepository;

        public ReviewExamAttemptCommandHandler(
            IExamRepository<ExamAttempt> attemptRepository,
            IExamRepository<ExamReview> reviewRepository,
            IExamReadRepository readRepository)
        {
            _attemptRepository = attemptRepository;
            _reviewRepository = reviewRepository;
            _readRepository = readRepository;
        }

        public async Task<Result<ExamAttemptResponse>> Handle(ReviewExamAttemptCommand request, CancellationToken ct)
        {
            var attempt = await _readRepository.GetAttemptWithDetailsAsync(request.AttemptId, asNoTracking: false, ct);

            if (attempt is null)
                return Result<ExamAttemptResponse>.Failure("Exam attempt is not found.", 404);

            var now = DateTimeOffset.UtcNow;
            var responsesById = attempt.Responses.ToDictionary(x => x.Id);
            foreach (var responseRequest in request.Responses ?? [])
            {
                if (!responsesById.TryGetValue(responseRequest.ResponseId, out var response))
                    return Result<ExamAttemptResponse>.Failure($"Response {responseRequest.ResponseId} does not belong to this attempt.", 400);

                response.Score = responseRequest.Score;
                response.IsCorrect = responseRequest.IsCorrect;
                response.Feedback = responseRequest.Feedback?.Trim();
                response.ReviewStatus = EExamReviewStatus.Reviewed;
                response.UpdatedAt = now;
            }

            var review = new ExamReview
            {
                ExamAttemptId = attempt.Id,
                ReviewerId = request.ReviewerId,
                Status = EExamReviewStatus.Reviewed,
                Score = request.Score,
                Feedback = request.Feedback?.Trim(),
                RubricJson = request.RubricJson,
                ReviewedAt = now,
                CreatedAt = now
            };
            await _reviewRepository.AddAsync(review, ct);

            var rawScore = attempt.Responses.Where(x => x.Score.HasValue).Sum(x => x.Score!.Value);
            attempt.RawScore = request.Score ?? rawScore;
            attempt.ScaledScore = attempt.RawScore;
            attempt.Status = EExamAttemptStatus.Completed;
            attempt.CompletedAt = now;
            attempt.UpdatedAt = now;

            foreach (var sectionAttempt in attempt.SectionAttempts)
                sectionAttempt.Status = EExamAttemptStatus.Completed;

            return Result<ExamAttemptResponse>.Success(attempt.ToResponse());
        }
    }
}
