using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTemplates.Commands.CreateExamTemplate
{
    public class CreateExamTemplateCommandHandler : IRequestHandler<CreateExamTemplateCommand, Result<ExamTemplateResponse>>
    {
        private readonly IExamRepository<ExamTemplate> _repository;
        private readonly IExamRepository<ExamType> _examTypeRepository;

        public CreateExamTemplateCommandHandler(IExamRepository<ExamTemplate> repository, IExamRepository<ExamType> examTypeRepository)
        {
            _repository = repository;
            _examTypeRepository = examTypeRepository;
        }

        public async Task<Result<ExamTemplateResponse>> Handle(CreateExamTemplateCommand request, CancellationToken ct)
        {
            if (!await _examTypeRepository.ExistsAsync(x => x.Id == request.ExamTypeId && x.IsActive, ct))
                return Result<ExamTemplateResponse>.Failure("Active exam type is not found.", 404);

            var code = request.Code.Trim().ToUpperInvariant();
            if (await _repository.ExistsAsync(x => x.Code == code, ct))
                return Result<ExamTemplateResponse>.Failure("Exam template code already exists.", 409);

            var entity = new ExamTemplate
            {
                ExamTypeId = request.ExamTypeId,
                Code = code,
                Name = request.Name.Trim(),
                Description = request.Description?.Trim(),
                DurationMinutes = request.DurationMinutes,
                TotalScore = request.TotalScore,
                Status = EExamTemplateStatus.Draft,
                IsActive = request.IsActive,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _repository.AddAsync(entity, ct);
            return Result<ExamTemplateResponse>.Success(entity.ToResponse(), 201);
        }
    }
}
