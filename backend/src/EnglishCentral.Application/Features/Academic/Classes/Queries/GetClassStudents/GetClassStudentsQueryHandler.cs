using EnglishCentral.Application.Features.Academic.Classes.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Classes.Queries.GetClassStudents
{
    public class GetClassStudentsQueryHandler
        : IRequestHandler<GetClassStudentsQuery, Result<List<ClassStudentResponse>>>
    {
        private readonly IStudentRepository _studentRepository;

        public GetClassStudentsQueryHandler(IStudentRepository studentRepository)
        {
            _studentRepository = studentRepository;
        }

        public async Task<Result<List<ClassStudentResponse>>> Handle(GetClassStudentsQuery request, CancellationToken ct)
        {
            var classStudents = await _studentRepository.GetStudentsByClassIdAsync(request.ClassId, ct);

            var students = classStudents
                .Select(student => new ClassStudentResponse(
                    student.StudentCode,
                    student.FullName,
                    student.PhoneNumber,
                    student.Email,
                    student.Status))
                .ToList();

            return Result<List<ClassStudentResponse>>.Success(students);
        }
    }
}
