using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTypes.Commands.UpdateExamType
{
    public class UpdateExamTypeCommandHandler : IRequestHandler<UpdateExamTypeCommand, Result<ExamTypeResponse>>
    {
        private readonly IExamRepository<ExamType> _repository;

        public UpdateExamTypeCommandHandler(IExamRepository<ExamType> repository)
        {
            _repository = repository;
        }

        public async Task<Result<ExamTypeResponse>> Handle(UpdateExamTypeCommand request, CancellationToken ct)
        {
            var entity = await _repository.GetByIdAsync(request.Id, ct);
            if (entity is null)
                return Result<ExamTypeResponse>.Failure("Exam type is not found.", 404);

            var code = request.Code.Trim().ToUpperInvariant();
            if (await _repository.ExistsAsync(x => x.Id != request.Id && x.Code == code, ct))
                return Result<ExamTypeResponse>.Failure("Exam type code already exists.", 409);

            entity.Code = code;
            entity.Name = request.Name.Trim();
            entity.Family = request.Family;
            entity.Description = request.Description?.Trim();
            entity.IsActive = request.IsActive;
            entity.UpdatedAt = DateTimeOffset.UtcNow;

            return Result<ExamTypeResponse>.Success(entity.ToResponse());
        }
    }
}
