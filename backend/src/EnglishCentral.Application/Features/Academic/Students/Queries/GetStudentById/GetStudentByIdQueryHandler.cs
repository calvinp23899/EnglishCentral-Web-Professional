using EnglishCentral.Application.Features.Academic.Students.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Students.Queries.GetStudentById
{
    public class GetStudentByIdQueryHandler : IRequestHandler<GetStudentByIdQuery, Result<StudentResponse>>
    {
        private readonly IStudentRepository _studentRepository;

        public GetStudentByIdQueryHandler(IStudentRepository studentRepository)
        {
            _studentRepository = studentRepository;
        }

        public async Task<Result<StudentResponse>> Handle(GetStudentByIdQuery request, CancellationToken ct)
        {
            var student = await _studentRepository.GetByStudentIdIncludedAccountAsync(request.userId, ct);

            if (student is null)
            {
                return Result<StudentResponse>.Failure("Student is not found.", 404);
            }

            return Result<StudentResponse>.Success(student.ToResponse());
        }
    }
}
