using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTypes.Commands.CreateExamType
{
    public class CreateExamTypeCommandHandler : IRequestHandler<CreateExamTypeCommand, Result<ExamTypeResponse>>
    {
        private readonly IExamRepository<ExamType> _repository;

        public CreateExamTypeCommandHandler(IExamRepository<ExamType> repository)
        {
            _repository = repository;
        }

        public async Task<Result<ExamTypeResponse>> Handle(CreateExamTypeCommand request, CancellationToken ct)
        {
            var code = request.Code.Trim().ToUpperInvariant();
            if (await _repository.ExistsAsync(x => x.Code == code, ct))
                return Result<ExamTypeResponse>.Failure("Exam type code already exists.", 409);

            var entity = new ExamType
            {
                Code = code,
                Name = request.Name.Trim(),
                Family = request.Family,
                Description = request.Description?.Trim(),
                IsActive = request.IsActive,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _repository.AddAsync(entity, ct);
            return Result<ExamTypeResponse>.Success(entity.ToResponse(), 201);
        }
    }
}
