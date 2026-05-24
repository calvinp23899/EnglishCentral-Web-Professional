using EnglishCentral.Domain.Entities.Academic;

namespace EnglishCentral.Application.Features.Academic.Students.DTOs
{
    public static class StudentMapping
    {
        public static StudentResponse ToResponse(this Student student)
        {
            return new StudentResponse(
                student.PublicId,
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
                student.Id,
                new StudentAccount
                (
                    student.Id,
                    student.User?.Email,
                    student.IsDeleted
                )
            );
        }
    }
}
