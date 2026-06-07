using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Commands.StartExamAttempt
{
    public class StartExamAttemptCommandHandler : IRequestHandler<StartExamAttemptCommand, Result<ExamAttemptResponse>>
    {
        private readonly IExamReadRepository _readRepository;
        private readonly IExamRepository<ExamAttempt> _attemptRepository;
        private readonly ICodeGenerator _codeGenerator;

        public StartExamAttemptCommandHandler(
            IExamReadRepository readRepository,
            IExamRepository<ExamAttempt> attemptRepository,
            ICodeGenerator codeGenerator)
        {
            _readRepository = readRepository;
            _attemptRepository = attemptRepository;
            _codeGenerator = codeGenerator;
        }

        public async Task<Result<ExamAttemptResponse>> Handle(StartExamAttemptCommand request, CancellationToken ct)
        {
            var version = await _readRepository.GetVersionWithSectionsAsync(request.ExamVersionId, ct);

            if (version is null)
                return Result<ExamAttemptResponse>.Failure("Exam version is not found.", 404);

            if (version.Status != EExamTemplateStatus.Published)
                return Result<ExamAttemptResponse>.Failure("Only published exam version can be attempted.", 400);

            var now = DateTimeOffset.UtcNow;
            var attempt = new ExamAttempt
            {
                ExamVersionId = request.ExamVersionId,
                StudentId = request.StudentId,
                AttemptCode = $"EXA-{_codeGenerator.GenerateCode()}",
                CandidateName = request.CandidateName?.Trim(),
                CandidateEmail = request.CandidateEmail?.Trim(),
                Status = EExamAttemptStatus.InProgress,
                StartedAt = now,
                CreatedAt = now
            };

            foreach (var section in version.Sections.OrderBy(x => x.OrderIndex))
            {
                attempt.SectionAttempts.Add(new ExamSectionAttempt
                {
                    ExamSectionId = section.Id,
                    Status = EExamAttemptStatus.InProgress,
                    StartedAt = now,
                    CreatedAt = now
                });
            }

            await _attemptRepository.AddAsync(attempt, ct);
            return Result<ExamAttemptResponse>.Success(attempt.ToResponse(), 201);
        }
    }
}
