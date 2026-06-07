using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTemplates.Queries.GetExamTemplateById
{
    public class GetExamTemplateByIdQueryHandler : IRequestHandler<GetExamTemplateByIdQuery, Result<ExamTemplateResponse>>
    {
        private readonly IExamRepository<ExamTemplate> _repository;

        public GetExamTemplateByIdQueryHandler(IExamRepository<ExamTemplate> repository)
        {
            _repository = repository;
        }

        public async Task<Result<ExamTemplateResponse>> Handle(GetExamTemplateByIdQuery request, CancellationToken ct)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
            return entity is null
                ? Result<ExamTemplateResponse>.Failure("Exam template is not found.", 404)
                : Result<ExamTemplateResponse>.Success(entity.ToResponse());
        }
    }
}
