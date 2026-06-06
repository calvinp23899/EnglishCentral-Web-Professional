using EnglishCentral.Application.Features.Academic.Classes.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Classes.Queries.GetClassStudents
{
    public class GetClassStudentsQueryHandler
        : IRequestHandler<GetClassStudentsQuery, Result<List<ClassStudentResponse>>>
    {
        private readonly IStudentRepository _studentRepository;
        private readonly IAcademicRepository<Enrollment> _enrollmentRepository;
        private readonly IFinanceRepository<EnrollmentPaymentPlan> _paymentPlanRepository;

        public GetClassStudentsQueryHandler(
            IStudentRepository studentRepository,
            IAcademicRepository<Enrollment> enrollmentRepository,
            IFinanceRepository<EnrollmentPaymentPlan> paymentPlanRepository)
        {
            _studentRepository = studentRepository;
            _enrollmentRepository = enrollmentRepository;
            _paymentPlanRepository = paymentPlanRepository;
        }

        public async Task<Result<List<ClassStudentResponse>>> Handle(GetClassStudentsQuery request, CancellationToken ct)
        {
            var classStudents = await _studentRepository.GetStudentsByClassIdAsync(request.ClassId, ct);
            var studentIds = classStudents.Select(x => x.Id).ToList();
            var enrollments = await _enrollmentRepository.ListAsync(
                q => q.Where(x => x.ClassId == request.ClassId && studentIds.Contains(x.StudentId)),
                ct);
            var enrollmentIds = enrollments.Select(x => x.Id).ToList();
            var paymentPlans = await _paymentPlanRepository.ListAsync(
                q => q.Where(x => enrollmentIds.Contains(x.EnrollmentId)),
                ct);

            var students = classStudents
                .Select(student =>
                {
                    var enrollment = enrollments.FirstOrDefault(x => x.StudentId == student.Id);
                    var paymentPlan = enrollment is null
                        ? null
                        : paymentPlans.FirstOrDefault(x => x.EnrollmentId == enrollment.Id);

                    return new ClassStudentResponse(
                        student.Id,
                        enrollment?.Id ?? 0,
                        paymentPlan?.Id,
                        student.StudentCode,
                        student.FullName,
                        student.PhoneNumber,
                        student.Email,
                        student.Status,
                        paymentPlan?.Type,
                        paymentPlan is null ? null : ToPlanFeeLabel(paymentPlan.Type));
                })
                .ToList();

            return Result<List<ClassStudentResponse>>.Success(students);
        }

        private static string ToPlanFeeLabel(EPaymentPlanType type)
        {
            return type switch
            {
                EPaymentPlanType.Monthly => "Hàng tháng",
                EPaymentPlanType.Installment => "Trả góp",
                _ => "Trả hết"
            };
        }
    }
}
