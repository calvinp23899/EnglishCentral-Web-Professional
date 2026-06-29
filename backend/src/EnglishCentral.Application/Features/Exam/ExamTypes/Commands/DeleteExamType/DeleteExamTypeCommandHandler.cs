using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTypes.Commands.DeleteExamType
{
    public class DeleteExamTypeCommandHandler : IRequestHandler<DeleteExamTypeCommand, Result<bool>>
    {
        private readonly IExamRepository<ExamType> _repository;
        private readonly IExamRepository<ExamTemplate> _templateRepository;

        public DeleteExamTypeCommandHandler(IExamRepository<ExamType> repository, IExamRepository<ExamTemplate> templateRepository)
        {
            _repository = repository;
            _templateRepository = templateRepository;
        }

        public async Task<Result<bool>> Handle(DeleteExamTypeCommand request, CancellationToken ct)
        {
            var entity = await _repository.GetByIdAsync(request.Id, ct);
            if (entity is null)
                return Result<bool>.Failure("Exam type is not found.", 404);

            if (await _templateRepository.ExistsAsync(x => x.ExamTypeId == request.Id, ct))
                return Result<bool>.Failure("Exam type already has templates. Archive it instead of deleting.", 409);

            entity.IsDeleted = true;
            entity.DeletedAt = DateTimeOffset.UtcNow;
            return Result<bool>.Success(true);
        }
    }
}
