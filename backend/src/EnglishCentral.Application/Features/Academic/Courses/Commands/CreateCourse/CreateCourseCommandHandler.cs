using EnglishCentral.Application.Features.Academic.Courses.DTOs;
using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Courses.Commands.CreateCourse
{
    public class CreateCourseCommandHandler : IRequestHandler<CreateCourseCommand, Result<CourseResponse>>
    {
        private readonly IAcademicRepository<Course> _courseRepository;
        private readonly IAcademicRepository<CourseCategory> _categoryRepository;
        private readonly IFinanceRepository<BillingPolicy> _billingPolicyRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CreateCourseCommandHandler(
            IAcademicRepository<Course> courseRepository,
            IAcademicRepository<CourseCategory> categoryRepository,
            IFinanceRepository<BillingPolicy> billingPolicyRepository,
            IUnitOfWork unitOfWork)
        {
            _courseRepository = courseRepository;
            _categoryRepository = categoryRepository;
            _billingPolicyRepository = billingPolicyRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<CourseResponse>> Handle(CreateCourseCommand request, CancellationToken ct)
        {
            if (!await _categoryRepository.ExistsAsync(x => x.Id == request.CourseCategoryId, ct))
                return Result<CourseResponse>.Failure("Course category is not found.", 404);
            if (request.DefaultBillingPolicyId.HasValue &&
                !await _billingPolicyRepository.ExistsAsync(x => x.Id == request.DefaultBillingPolicyId.Value && x.IsActive, ct))
                return Result<CourseResponse>.Failure("Active billing policy is not found.", 404);

            var code = request.Code.Trim();
            if (await _courseRepository.ExistsAsync(x => x.Code == code, ct))
                return Result<CourseResponse>.Failure("Course code already exists.", 409);

            var course = new Course
            {
                CourseCategoryId = request.CourseCategoryId,
                DefaultBillingPolicyId = request.DefaultBillingPolicyId,
                Code = code,
                Name = request.Name.Trim(),
                Description = request.Description?.Trim(),
                Level = request.Level?.Trim(),
                DurationWeeks = request.DurationWeeks,
                TotalSessions = request.TotalSessions,
                SessionDurationMinutes = request.SessionDurationMinutes,
                TuitionFee = request.TuitionFee,
                MaxStudents = request.MaxStudents,
                DisplayOrder = request.DisplayOrder,
                IsPublished = request.IsPublished,
                IsActive = request.IsActive,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _courseRepository.AddAsync(course, ct);
            await _unitOfWork.SaveChangesAsync(ct);
            return Result<CourseResponse>.Success(course.ToResponse(), 201);
        }
    }
}
