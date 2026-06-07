using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTemplates.Commands.DeleteExamTemplate
{
    public class DeleteExamTemplateCommandHandler : IRequestHandler<DeleteExamTemplateCommand, Result<bool>>
    {
        private readonly IExamRepository<ExamTemplate> _repository;

        public DeleteExamTemplateCommandHandler(IExamRepository<ExamTemplate> repository)
        {
            _repository = repository;
        }

        public async Task<Result<bool>> Handle(DeleteExamTemplateCommand request, CancellationToken ct)
        {
            var entity = await _repository.GetByIdAsync(request.Id, ct);
            if (entity is null)
                return Result<bool>.Failure("Exam template is not found.", 404);

            entity.Status = EExamTemplateStatus.Archived;
            entity.IsActive = false;
            entity.IsDeleted = true;
            entity.DeletedAt = DateTimeOffset.UtcNow;
            return Result<bool>.Success(true);
        }
    }
}
