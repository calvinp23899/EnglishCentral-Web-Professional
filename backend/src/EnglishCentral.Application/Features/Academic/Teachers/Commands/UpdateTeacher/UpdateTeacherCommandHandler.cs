using EnglishCentral.Application.Features.Academic.Teachers.DTOs;
using EnglishCentral.Application.Interfaces.Academic.ITeacher;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Teachers.Commands.UpdateTeacher
{
    public class UpdateTeacherCommandHandler : IRequestHandler<UpdateTeacherCommand, Result<TeacherResponse>>
    {
        private readonly ITeacherRepository _repo;

        public UpdateTeacherCommandHandler(ITeacherRepository repo)
        {
            _repo = repo;
        }

        public async Task<Result<TeacherResponse>> Handle(UpdateTeacherCommand request, CancellationToken ct)
        {
            var teacher = await _repo.GetByIdAsync(
                    request.TeacherId,
                    ct);

            if (teacher is null)
            {
                return Result<TeacherResponse>
                    .Failure(
                        "Teacher not found",
                        404);
            }

            teacher.FullName = request.FullName;
            teacher.Email = request.Email;
            teacher.PhoneNumber = request.PhoneNumber;
            teacher.Specialization = request.Specialization;
            teacher.Bio = request.Bio;
            teacher.HireDate = request.HireDate;
            teacher.Status = request.Status;

            return Result<TeacherResponse>
                .Success(
                    teacher.ToResponse());
        }
    }
}
