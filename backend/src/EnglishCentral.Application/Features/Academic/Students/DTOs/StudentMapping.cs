using EnglishCentral.Domain.Entities.Academic;

namespace EnglishCentral.Application.Features.Academic.Students.DTOs
{
    public static class StudentMapping
    {
        public static StudentResponse ToResponse(this Student student)
        {
            return new StudentResponse(
                student.PublicId,
                student.Id,
                student.StudentCode,
                student.FullName,
                student.DateOfBirth,
                student.Gender,
                student.Email,
                student.PhoneNumber,
                student.Address,
                student.ParentName,
                student.ParentPhoneNumber,
                student.EnrollmentDate,
                student.Status,
                student.Notes,
                student.UserId,
                student.User is null
                    ? null
                    : new StudentAccount
                    (
                        student.User.Id,
                        student.User.Email,
                        student.User.IsDeleted
                    )
            );
        }
    }
}
