using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Common.Helpers;
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
            string name = string.Empty;
            if (this.GetListEnumFamily().Contains(request.Family))
            {
                name = this.GetDefaultEnumName(request.Family);
            }
            else
            {
                //FAMILY = CUSTOM
                name = request.Name.Trim().ToUpperInvariant();
            }
            string code = request.Code.Trim().ToUpperInvariant();
            if (await _repository.ExistsAsync(x => x.Code == code, ct))
                return Result<ExamTypeResponse>.Failure("Exam type code already exists.", 409);

            var entity = new ExamType
            {
                Code = code,
                Name = name,
                Family = request.Family,
                Description = request.Description?.Trim(),
                IsActive = request.IsActive,
            };

            await _repository.AddAsync(entity, ct);
            return Result<ExamTypeResponse>.Success(entity.ToResponse(), 201);
        }

        private string GetDefaultEnumName(EExamFamily request)
        {
            string code = string.Empty;
            code = request switch
            {
                EExamFamily.IELTS => EExamFamily.IELTS.ToDescription(),
                EExamFamily.TOEIC => EExamFamily.TOEIC.ToDescription(),
                EExamFamily.PTE => EExamFamily.PTE.ToDescription(),
                EExamFamily.KET => EExamFamily.PTE.ToDescription(),
                EExamFamily.PET => EExamFamily.PTE.ToDescription(),
                EExamFamily.VSTEP => EExamFamily.PTE.ToDescription(),
                _ => string.Empty
            };
            return code;
        }

        private List<EExamFamily> GetListEnumFamily()
        {
            var families = new List<EExamFamily>
            {
                EExamFamily.IELTS,
                EExamFamily.TOEIC,
                EExamFamily.VSTEP,
                EExamFamily.PET,
                EExamFamily.PTE,
                EExamFamily.KET,
            };
            return families;
        }
    }
}
