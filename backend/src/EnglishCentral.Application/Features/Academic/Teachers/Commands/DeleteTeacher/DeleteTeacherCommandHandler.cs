using EnglishCentral.Application.Interfaces.Academic.ITeacher;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Teachers.Commands.DeleteTeacher
{
    public class DeleteTeacherCommandHandler : IRequestHandler<DeleteTeacherCommand, Result<bool>>
    {
        private readonly ITeacherRepository _repo;

        public DeleteTeacherCommandHandler(
            ITeacherRepository repo)
        {
            _repo = repo;
        }

        public async Task<Result<bool>> Handle(DeleteTeacherCommand request, CancellationToken ct)
        {
            var teacher = await _repo.GetByIdAsync(
                    request.TeacherId,
                    ct);

            if (teacher is null)
            {
                return Result<bool>
                    .Failure(
                        "Teacher not found",
                        404);
            }

            teacher.IsDeleted = true;

            return Result<bool>.Success(true, 200);
        }
    }
}
