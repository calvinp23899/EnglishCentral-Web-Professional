using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Commands.PublishExamVersion
{
    public class PublishExamVersionCommandHandler : IRequestHandler<PublishExamVersionCommand, Result<ExamVersionResponse>>
    {
        private readonly IExamRepository<ExamVersion> _repository;
        private readonly IExamRepository<ExamTemplate> _templateRepository;
        private readonly IExamReadRepository _readRepository;

        public PublishExamVersionCommandHandler(
            IExamRepository<ExamVersion> repository,
            IExamRepository<ExamTemplate> templateRepository,
            IExamReadRepository readRepository)
        {
            _repository = repository;
            _templateRepository = templateRepository;
            _readRepository = readRepository;
        }

        public async Task<Result<ExamVersionResponse>> Handle(PublishExamVersionCommand request, CancellationToken ct)
        {
            var version = await _readRepository.GetVersionWithContentAsync(request.Id, asNoTracking: false, ct);

            if (version is null)
                return Result<ExamVersionResponse>.Failure("Exam version is not found.", 404);

            if (!version.Sections.Any())
                return Result<ExamVersionResponse>.Failure("Exam version must have at least one section before publish.", 400);

            var template = await _templateRepository.GetByIdAsync(version.ExamTemplateId, ct);
            if (template is null)
                return Result<ExamVersionResponse>.Failure("Exam template is not found.", 404);

            version.Status = EExamTemplateStatus.Published;
            version.PublishedAt ??= DateTimeOffset.UtcNow;
            version.UpdatedAt = DateTimeOffset.UtcNow;

            template.CurrentVersionId = version.Id;
            template.Status = EExamTemplateStatus.Published;
            template.UpdatedAt = DateTimeOffset.UtcNow;

            return Result<ExamVersionResponse>.Success(version.ToResponse());
        }
    }
}
