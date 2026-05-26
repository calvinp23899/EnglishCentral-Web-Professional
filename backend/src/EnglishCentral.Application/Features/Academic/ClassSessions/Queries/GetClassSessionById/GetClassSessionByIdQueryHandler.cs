using EnglishCentral.Application.Features.Academic.ClassSessions.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.ClassSessions.Queries.GetClassSessionById
{
    public class GetClassSessionByIdQueryHandler : IRequestHandler<GetClassSessionByIdQuery, Result<ClassSessionResponse>>
    {
        private readonly IAcademicRepository<ClassSession> _repository;

        public GetClassSessionByIdQueryHandler(IAcademicRepository<ClassSession> repository)
        {
            _repository = repository;
        }

        public async Task<Result<ClassSessionResponse>> Handle(GetClassSessionByIdQuery request, CancellationToken ct)
        {
            var session = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
            return session is null
                ? Result<ClassSessionResponse>.Failure("Class session is not found.", 404)
                : Result<ClassSessionResponse>.Success(session.ToResponse());
        }
    }
}
