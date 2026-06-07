using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTypes.Queries.GetExamTypeById
{
    public class GetExamTypeByIdQueryHandler : IRequestHandler<GetExamTypeByIdQuery, Result<ExamTypeResponse>>
    {
        private readonly IExamRepository<ExamType> _repository;

        public GetExamTypeByIdQueryHandler(IExamRepository<ExamType> repository)
        {
            _repository = repository;
        }

        public async Task<Result<ExamTypeResponse>> Handle(GetExamTypeByIdQuery request, CancellationToken ct)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
            return entity is null
                ? Result<ExamTypeResponse>.Failure("Exam type is not found.", 404)
                : Result<ExamTypeResponse>.Success(entity.ToResponse());
        }
    }
}
