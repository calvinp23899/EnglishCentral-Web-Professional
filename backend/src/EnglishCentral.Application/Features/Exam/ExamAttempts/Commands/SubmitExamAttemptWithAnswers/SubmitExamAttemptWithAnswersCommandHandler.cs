using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Features.Exam.ExamAttempts.Services;
using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;
using DomainExamQuestionResponse = EnglishCentral.Domain.Entities.Exam.ExamQuestionResponse;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Commands.SubmitExamAttemptWithAnswers
{
    public class SubmitExamAttemptWithAnswersCommandHandler : IRequestHandler<SubmitExamAttemptWithAnswersCommand, Result<ExamAttemptResponse>>
    {
        private readonly IExamReadRepository _readRepository;
        private readonly IExamRepository<ExamAttempt> _attemptRepository;
        private readonly ICodeGenerator _codeGenerator;

        public SubmitExamAttemptWithAnswersCommandHandler(
            IExamReadRepository readRepository,
            IExamRepository<ExamAttempt> attemptRepository,
            ICodeGenerator codeGenerator)
        {
            _readRepository = readRepository;
            _attemptRepository = attemptRepository;
            _codeGenerator = codeGenerator;
        }

        public async Task<Result<ExamAttemptResponse>> Handle(SubmitExamAttemptWithAnswersCommand request, CancellationToken ct)
        {
            var version = await _readRepository.GetVersionWithContentAsync(request.ExamVersionId, asNoTracking: true, ct);
            if (version is null)
                return Result<ExamAttemptResponse>.Failure("Exam version is not found.", 404);

            if (version.Status != EExamTemplateStatus.Published)
                return Result<ExamAttemptResponse>.Failure("Only published exam version can be submitted.", 400);

            var questions = version.Sections
                .SelectMany(x => x.Parts)
                .SelectMany(x => x.QuestionGroups)
                .SelectMany(x => x.Questions)
                .ToDictionary(x => x.Id);

            var duplicateQuestionIds = request.Answers
                .GroupBy(x => x.QuestionId)
                .Where(x => x.Count() > 1)
                .Select(x => x.Key)
                .ToList();

            if (duplicateQuestionIds.Count > 0)
                return Result<ExamAttemptResponse>.Failure($"Duplicate answers for question ids: {string.Join(", ", duplicateQuestionIds)}.", 400);

            var invalidQuestionIds = request.Answers
                .Where(x => !questions.ContainsKey(x.QuestionId))
                .Select(x => x.QuestionId)
                .Distinct()
                .ToList();

            if (invalidQuestionIds.Count > 0)
                return Result<ExamAttemptResponse>.Failure($"Question ids do not belong to this exam version: {string.Join(", ", invalidQuestionIds)}.", 400);

            var invalidOptionIds = request.Answers
                .Where(answer => answer.AnswerOptionId.HasValue
                    && !questions[answer.QuestionId].AnswerOptions.Any(option => option.Id == answer.AnswerOptionId.Value))
                .Select(x => x.AnswerOptionId!.Value)
                .Distinct()
                .ToList();

            if (invalidOptionIds.Count > 0)
                return Result<ExamAttemptResponse>.Failure($"Answer option ids do not belong to the submitted questions: {string.Join(", ", invalidOptionIds)}.", 400);

            var submittedAt = DateTimeOffset.UtcNow;
            var startedAt = request.StartedAt ?? submittedAt;
            if (startedAt > submittedAt)
                startedAt = submittedAt;

            var attempt = new ExamAttempt
            {
                ExamVersionId = request.ExamVersionId,
                StudentId = request.StudentId,
                AttemptCode = $"EXA-{_codeGenerator.GenerateCode()}",
                CandidateName = request.CandidateName?.Trim(),
                CandidateEmail = request.CandidateEmail?.Trim(),
                Mode = request.Mode ?? EExamAttemptMode.Practice,
                Status = EExamAttemptStatus.InProgress,
                StartedAt = startedAt,
                CreatedAt = submittedAt
            };

            var sectionAttemptBySectionId = new Dictionary<long, ExamSectionAttempt>();
            foreach (var section in version.Sections.OrderBy(x => x.OrderIndex))
            {
                var sectionAttempt = new ExamSectionAttempt
                {
                    ExamSectionId = section.Id,
                    Status = EExamAttemptStatus.InProgress,
                    StartedAt = startedAt,
                    CreatedAt = submittedAt
                };

                sectionAttemptBySectionId[section.Id] = sectionAttempt;
                attempt.SectionAttempts.Add(sectionAttempt);
            }

            var sectionIdByQuestionId = version.Sections
                .SelectMany(section => section.Parts
                    .SelectMany(part => part.QuestionGroups
                        .SelectMany(group => group.Questions
                            .Select(question => new { QuestionId = question.Id, SectionId = section.Id }))))
                .ToDictionary(x => x.QuestionId, x => x.SectionId);

            foreach (var answer in request.Answers)
            {
                var sectionId = sectionIdByQuestionId[answer.QuestionId];
                attempt.Responses.Add(new DomainExamQuestionResponse
                {
                    ExamQuestionId = answer.QuestionId,
                    ExamAnswerOptionId = answer.AnswerOptionId,
                    ExamSectionAttempt = sectionAttemptBySectionId[sectionId],
                    AnswerText = answer.AnswerText,
                    AnswerJson = answer.AnswerJson,
                    AnsweredAt = submittedAt,
                    CreatedAt = submittedAt
                });
            }

            ExamAttemptScoringService.ScoreAttempt(attempt, version, submittedAt);

            await _attemptRepository.AddAsync(attempt, ct);
            return Result<ExamAttemptResponse>.Success(attempt.ToResponse(), 201);
        }
    }
}
