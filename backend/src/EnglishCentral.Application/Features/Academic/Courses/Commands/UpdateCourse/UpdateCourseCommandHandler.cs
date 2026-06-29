using EnglishCentral.Application.Features.Academic.Courses.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Courses.Commands.UpdateCourse
{
    public class UpdateCourseCommandHandler : IRequestHandler<UpdateCourseCommand, Result<CourseResponse>>
    {
        private readonly IAcademicRepository<Course> _courseRepository;
        private readonly IAcademicRepository<CourseCategory> _categoryRepository;
        private readonly IFinanceRepository<BillingPolicy> _billingPolicyRepository;

        public UpdateCourseCommandHandler(
            IAcademicRepository<Course> courseRepository,
            IAcademicRepository<CourseCategory> categoryRepository,
            IFinanceRepository<BillingPolicy> billingPolicyRepository)
        {
            _courseRepository = courseRepository;
            _categoryRepository = categoryRepository;
            _billingPolicyRepository = billingPolicyRepository;
        }

        public async Task<Result<CourseResponse>> Handle(UpdateCourseCommand request, CancellationToken ct)
        {
            var course = await _courseRepository.GetByIdAsync(request.Id, ct);
            if (course is null)
                return Result<CourseResponse>.Failure("Course is not found.", 404);

            if (!await _categoryRepository.ExistsAsync(x => x.Id == request.CourseCategoryId, ct))
                return Result<CourseResponse>.Failure("Course category is not found.", 404);
            if (request.DefaultBillingPolicyId.HasValue &&
                !await _billingPolicyRepository.ExistsAsync(x => x.Id == request.DefaultBillingPolicyId.Value && x.IsActive, ct))
                return Result<CourseResponse>.Failure("Active billing policy is not found.", 404);

            var code = request.Code.Trim();
            if (await _courseRepository.ExistsAsync(x => x.Id != request.Id && x.Code == code, ct))
                return Result<CourseResponse>.Failure("Course code already exists.", 409);

            course.CourseCategoryId = request.CourseCategoryId;
            course.DefaultBillingPolicyId = request.DefaultBillingPolicyId;
            course.Code = code;
            course.Name = request.Name.Trim();
            course.Description = request.Description?.Trim();
            course.Level = request.Level?.Trim();
            course.DurationWeeks = request.DurationWeeks;
            course.TotalSessions = request.TotalSessions;
            course.SessionDurationMinutes = request.SessionDurationMinutes;
            course.TuitionFee = request.TuitionFee;
            course.MaxStudents = request.MaxStudents;
            course.DisplayOrder = request.DisplayOrder;
            course.IsPublished = request.IsPublished;
            course.IsActive = request.IsActive;
            course.UpdatedAt = DateTimeOffset.UtcNow;

            return Result<CourseResponse>.Success(course.ToResponse());
        }
    }
}
