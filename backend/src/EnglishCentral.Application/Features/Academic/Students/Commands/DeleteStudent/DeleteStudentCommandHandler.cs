using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Students.Commands.DeleteStudent
{
    public class DeleteStudentCommandHandler : IRequestHandler<DeleteStudentCommand, Result<bool>>
    {
        private readonly IStudentRepository _studentRepository;

        public DeleteStudentCommandHandler(IStudentRepository studentRepository)
        {
            _studentRepository = studentRepository;
        }

        public async Task<Result<bool>> Handle(DeleteStudentCommand request, CancellationToken ct)
        {
            var student = await _studentRepository.GetByIdAsync(request.Id, ct);
            if (student is null)
            {
                return Result<bool>.Failure("Student is not found.", 404);
            }

            student.IsDeleted = true;
            student.DeletedAt = DateTimeOffset.UtcNow;
            student.UpdatedAt = DateTimeOffset.UtcNow;
            //student.DeletedBy = 
            return Result<bool>.Success(true);
        }
    }
}
