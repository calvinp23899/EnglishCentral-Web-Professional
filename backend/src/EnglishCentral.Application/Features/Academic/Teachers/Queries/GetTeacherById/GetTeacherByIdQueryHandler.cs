using EnglishCentral.Application.Features.Academic.Teachers.DTOs;
using EnglishCentral.Application.Interfaces.Academic.ITeacher;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Teachers.Queries.GetTeacherById
{
    public class GetTeacherByIdQueryHandler : IRequestHandler<GetTeacherByIdQuery, Result<TeacherResponse>>
    {
        private readonly ITeacherRepository _teacherRepository;

        public GetTeacherByIdQueryHandler(
            ITeacherRepository teacherRepository)
        {
            _teacherRepository = teacherRepository;
        }

        public async Task<Result<TeacherResponse>> Handle(GetTeacherByIdQuery request, CancellationToken ct)
        {
            var teacher = await _teacherRepository
                    .GetByTeacherIdIncludedAccountAsync(
                        request.TeacherId,
                        ct);

            if (teacher is null)
            {
                return Result<TeacherResponse>
                    .Failure(
                        "Teacher not found.",
                        404);
            }

            return Result<TeacherResponse>
                .Success(
                    teacher.ToResponse());
        }
    }
}
