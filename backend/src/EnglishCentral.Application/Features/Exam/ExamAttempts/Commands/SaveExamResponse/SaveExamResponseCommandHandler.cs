using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;
using DomainExamQuestionResponse = EnglishCentral.Domain.Entities.Exam.ExamQuestionResponse;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Commands.SaveExamResponse
{
    public class SaveExamResponseCommandHandler : IRequestHandler<SaveExamResponseCommand, Result<ExamQuestionResponseResponse>>
    {
        private readonly IExamRepository<ExamAttempt> _attemptRepository;
        private readonly IExamRepository<DomainExamQuestionResponse> _responseRepository;
        private readonly IExamRepository<ExamQuestion> _questionRepository;
        private readonly IExamReadRepository _readRepository;

        public SaveExamResponseCommandHandler(
            IExamRepository<ExamAttempt> attemptRepository,
            IExamRepository<DomainExamQuestionResponse> responseRepository,
            IExamRepository<ExamQuestion> questionRepository,
            IExamReadRepository readRepository)
        {
            _attemptRepository = attemptRepository;
            _responseRepository = responseRepository;
            _questionRepository = questionRepository;
            _readRepository = readRepository;
        }

        public async Task<Result<ExamQuestionResponseResponse>> Handle(SaveExamResponseCommand request, CancellationToken ct)
        {
            var attempt = await _readRepository.GetAttemptWithDetailsAsync(request.AttemptId, asNoTracking: true, ct);

            if (attempt is null)
                return Result<ExamQuestionResponseResponse>.Failure("Exam attempt is not found.", 404);

            if (attempt.Status is not EExamAttemptStatus.InProgress)
                return Result<ExamQuestionResponseResponse>.Failure("Only in-progress attempt can be updated.", 400);

            if (!await _questionRepository.ExistsAsync(x => x.Id == request.QuestionId, ct))
                return Result<ExamQuestionResponseResponse>.Failure("Exam question is not found.", 404);

            if (request.SectionAttemptId.HasValue && attempt.SectionAttempts.All(x => x.Id != request.SectionAttemptId.Value))
                return Result<ExamQuestionResponseResponse>.Failure("Section attempt does not belong to this attempt.", 400);

            var response = await _responseRepository.FirstOrDefaultAsync(
                x => x.ExamAttemptId == request.AttemptId && x.ExamQuestionId == request.QuestionId,
                ct,
                asNoTracking: false);

            if (response is null)
            {
                response = new DomainExamQuestionResponse
                {
                    ExamAttemptId = request.AttemptId,
                    ExamQuestionId = request.QuestionId,
                    CreatedAt = DateTimeOffset.UtcNow
                };
                await _responseRepository.AddAsync(response, ct);
            }

            response.ExamSectionAttemptId = request.SectionAttemptId;
            response.ExamAnswerOptionId = request.AnswerOptionId;
            response.AnswerText = request.AnswerText;
            response.AnswerJson = request.AnswerJson;
            response.AnsweredAt = DateTimeOffset.UtcNow;
            response.UpdatedAt = DateTimeOffset.UtcNow;

            return Result<ExamQuestionResponseResponse>.Success(response.ToResponse());
        }
    }
}
