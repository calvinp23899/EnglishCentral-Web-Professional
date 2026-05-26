using EnglishCentral.Application.Features.Academic.Classes.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Shared.Results;
using MediatR;
using AcademicClass = EnglishCentral.Domain.Entities.Academic.Class;

namespace EnglishCentral.Application.Features.Academic.Classes.Queries.GetClassById
{
    public class GetClassByIdQueryHandler : IRequestHandler<GetClassByIdQuery, Result<ClassResponse>>
    {
        private readonly IAcademicRepository<AcademicClass> _repository;

        public GetClassByIdQueryHandler(IAcademicRepository<AcademicClass> repository)
        {
            _repository = repository;
        }

        public async Task<Result<ClassResponse>> Handle(GetClassByIdQuery request, CancellationToken ct)
        {
            var classroom = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
            return classroom is null
                ? Result<ClassResponse>.Failure("Class is not found.", 404)
                : Result<ClassResponse>.Success(classroom.ToResponse());
        }
    }
}
