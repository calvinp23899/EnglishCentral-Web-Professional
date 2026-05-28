using EnglishCentral.Application.Features.Finance.Summaries.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Summaries.Queries.GetBillingSummary
{
    public class GetBillingSummaryQueryHandler : IRequestHandler<GetBillingSummaryQuery, Result<BillingSummaryResponse>>
    {
        private readonly IAcademicRepository<Enrollment> _enrollmentRepository;
        private readonly IFinanceRepository<Invoice> _invoiceRepository;

        public GetBillingSummaryQueryHandler(IAcademicRepository<Enrollment> enrollmentRepository, IFinanceRepository<Invoice> invoiceRepository)
        {
            _enrollmentRepository = enrollmentRepository;
            _invoiceRepository = invoiceRepository;
        }

        public async Task<Result<BillingSummaryResponse>> Handle(GetBillingSummaryQuery request, CancellationToken ct)
        {
            var enrollments = await _enrollmentRepository.ListAsync(q =>
            {
                if (request.EnrollmentId.HasValue) q = q.Where(x => x.Id == request.EnrollmentId.Value);
                if (request.StudentId.HasValue) q = q.Where(x => x.StudentId == request.StudentId.Value);
                return q;
            }, ct);

            var enrollmentIds = enrollments.Select(x => x.Id).ToList();
            var invoices = await _invoiceRepository.ListAsync(q => q.Where(x => enrollmentIds.Contains(x.EnrollmentId)), ct);

            return Result<BillingSummaryResponse>.Success(new BillingSummaryResponse(
                request.EnrollmentId,
                request.StudentId,
                enrollments.Sum(x => x.FinalAmount),
                enrollments.Sum(x => x.PaidAmount),
                enrollments.Sum(x => x.OutstandingAmount),
                invoices.Count,
                invoices.Count(x => x.Status == EInvoiceStatus.Overdue)));
        }
    }
}
