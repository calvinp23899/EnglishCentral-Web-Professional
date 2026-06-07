using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTemplates.Commands.UpdateExamTemplate
{
    public class UpdateExamTemplateCommandHandler : IRequestHandler<UpdateExamTemplateCommand, Result<ExamTemplateResponse>>
    {
        private readonly IExamRepository<ExamTemplate> _repository;

        public UpdateExamTemplateCommandHandler(IExamRepository<ExamTemplate> repository)
        {
            _repository = repository;
        }

        public async Task<Result<ExamTemplateResponse>> Handle(UpdateExamTemplateCommand request, CancellationToken ct)
        {
            var entity = await _repository.GetByIdAsync(request.Id, ct);
            if (entity is null)
                return Result<ExamTemplateResponse>.Failure("Exam template is not found.", 404);

            var code = request.Code.Trim().ToUpperInvariant();
            if (await _repository.ExistsAsync(x => x.Id != request.Id && x.Code == code, ct))
                return Result<ExamTemplateResponse>.Failure("Exam template code already exists.", 409);

            entity.Code = code;
            entity.Name = request.Name.Trim();
            entity.Description = request.Description?.Trim();
            entity.DurationMinutes = request.DurationMinutes;
            entity.TotalScore = request.TotalScore;
            entity.IsActive = request.IsActive;
            entity.UpdatedAt = DateTimeOffset.UtcNow;

            return Result<ExamTemplateResponse>.Success(entity.ToResponse());
        }
    }
}
