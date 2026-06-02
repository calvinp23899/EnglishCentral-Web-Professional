using EnglishCentral.Application.Features.Academic.Students.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Students.Queries.GetStudentListEnrollment
{
    public class GetStudentListEnrollmentQueryHandler
        : IRequestHandler<GetStudentListEnrollmentQuery, Result<List<StudentEnrollmentOptionResponse>>>
    {
        private readonly IStudentRepository _studentRepository;

        public GetStudentListEnrollmentQueryHandler(IStudentRepository studentRepository)
        {
            _studentRepository = studentRepository;
        }

        public async Task<Result<List<StudentEnrollmentOptionResponse>>> Handle(
            GetStudentListEnrollmentQuery request,
            CancellationToken ct)
        {
            var students = await _studentRepository.GetActiveStudentsForEnrollmentAsync(request.Search, ct);

            var items = students
                .Select(student => new StudentEnrollmentOptionResponse(
                    student.Id,
                    student.StudentCode,
                    student.FullName,
                    student.PhoneNumber,
                    student.Email,
                    student.Status))
                .ToList();

            return Result<List<StudentEnrollmentOptionResponse>>.Success(items);
        }
    }
}
