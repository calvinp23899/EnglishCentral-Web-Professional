using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Invoices.Commands.BulkCreateInvoicesFromPaymentPlanItems
{
    public class BulkCreateInvoicesFromPaymentPlanItemsCommandHandler
        : IRequestHandler<BulkCreateInvoicesFromPaymentPlanItemsCommand, Result<BulkCreateInvoicesFromPaymentPlanItemsResponse>>
    {
        private readonly IFinanceRepository<EnrollmentPaymentPlan> _paymentPlanRepository;
        private readonly IFinanceRepository<EnrollmentPaymentPlanItem> _paymentPlanItemRepository;
        private readonly IFinanceRepository<Invoice> _invoiceRepository;
        private readonly IAcademicRepository<Enrollment> _enrollmentRepository;
        private readonly IAcademicRepository<Student> _studentRepository;
        private readonly IAcademicRepository<Class> _classRepository;
        private readonly IUnitOfWork _unitOfWork;

        public BulkCreateInvoicesFromPaymentPlanItemsCommandHandler(
            IFinanceRepository<EnrollmentPaymentPlan> paymentPlanRepository,
            IFinanceRepository<EnrollmentPaymentPlanItem> paymentPlanItemRepository,
            IFinanceRepository<Invoice> invoiceRepository,
            IAcademicRepository<Enrollment> enrollmentRepository,
            IAcademicRepository<Student> studentRepository,
            IAcademicRepository<Class> classRepository,
            IUnitOfWork unitOfWork)
        {
            _paymentPlanRepository = paymentPlanRepository;
            _paymentPlanItemRepository = paymentPlanItemRepository;
            _invoiceRepository = invoiceRepository;
            _enrollmentRepository = enrollmentRepository;
            _studentRepository = studentRepository;
            _classRepository = classRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<BulkCreateInvoicesFromPaymentPlanItemsResponse>> Handle(
            BulkCreateInvoicesFromPaymentPlanItemsCommand request,
            CancellationToken ct)
        {
            var plan = await _paymentPlanRepository.GetByIdAsync(request.PaymentPlanId, ct);
            if (plan is null)
                return Result<BulkCreateInvoicesFromPaymentPlanItemsResponse>.Failure("Payment plan is not found.", 404);
            if (plan.Status == EPaymentPlanStatus.Cancelled)
                return Result<BulkCreateInvoicesFromPaymentPlanItemsResponse>.Failure("Cancelled payment plan cannot be invoiced.", 400);

            var enrollment = await _enrollmentRepository.GetByIdAsync(plan.EnrollmentId, ct);
            if (enrollment is null)
                return Result<BulkCreateInvoicesFromPaymentPlanItemsResponse>.Failure("Enrollment is not found.", 404);
            if (enrollment.Status == EEnrollmentStatus.Dropped)
                return Result<BulkCreateInvoicesFromPaymentPlanItemsResponse>.Failure("Cancelled enrollment cannot be invoiced.", 400);

            var selectedItemIds = request.PaymentPlanItemIds.Distinct().ToList();
            var items = await _paymentPlanItemRepository.ListAsync(
                q => q.Where(x => selectedItemIds.Contains(x.Id)),
                ct,
                asNoTracking: false);

            if (items.Count != selectedItemIds.Count)
                return Result<BulkCreateInvoicesFromPaymentPlanItemsResponse>.Failure("One or more payment plan items are not found.", 404);
            if (items.Any(x => x.PaymentPlanId != plan.Id))
                return Result<BulkCreateInvoicesFromPaymentPlanItemsResponse>.Failure("One or more payment plan items do not belong to this payment plan.", 400);
            if (items.Any(x => x.Status == EPaymentPlanItemStatus.Paid))
                return Result<BulkCreateInvoicesFromPaymentPlanItemsResponse>.Failure("Paid payment plan items cannot be invoiced.", 400);
            if (items.Any(x => x.Status == EPaymentPlanItemStatus.Cancelled))
                return Result<BulkCreateInvoicesFromPaymentPlanItemsResponse>.Failure("Cancelled payment plan items cannot be invoiced.", 400);

            var invoices = await _invoiceRepository.ListAsync(
                q => q.Where(x => x.PaymentPlanItemId.HasValue && selectedItemIds.Contains(x.PaymentPlanItemId.Value)),
                ct,
                asNoTracking: false);

            if (invoices.Any(x => x.Status == EInvoiceStatus.Cancelled))
                return Result<BulkCreateInvoicesFromPaymentPlanItemsResponse>.Failure("Cancelled invoices cannot be prepared for payment.", 400);
            if (invoices.Any(x => x.Status == EInvoiceStatus.Paid || x.OutstandingAmount <= 0))
                return Result<BulkCreateInvoicesFromPaymentPlanItemsResponse>.Failure("Paid invoices cannot be prepared for payment.", 400);

            var now = DateTimeOffset.UtcNow;
            var createdInvoiceItemIds = new HashSet<long>();
            foreach (var item in items)
            {
                if (invoices.Any(x => x.PaymentPlanItemId == item.Id))
                    continue;

                var invoice = CreateInvoice(enrollment.Id, item, now, request.Notes);
                invoices.Add(invoice);
                createdInvoiceItemIds.Add(item.Id);
                await _invoiceRepository.AddAsync(invoice, ct);

                item.Status = EPaymentPlanItemStatus.Invoiced;
                item.UpdatedAt = now;
            }

            await _unitOfWork.SaveChangesAsync(ct);

            var student = await _studentRepository.GetByIdAsync(enrollment.StudentId, ct);
            var classroom = await _classRepository.GetByIdAsync(enrollment.ClassId, ct);

            var responseItems = items
                .OrderBy(x => x.SequenceNumber)
                .Select(item =>
                {
                    var invoice = invoices.First(x => x.PaymentPlanItemId == item.Id);
                    return new BulkCreatedInvoiceItemResponse(
                        item.Id,
                        item.SequenceNumber,
                        item.Name,
                        item.DueDate,
                        item.Amount,
                        item.Status,
                        invoice.Id,
                        invoice.InvoiceNo,
                        invoice.Status,
                        invoice.OutstandingAmount,
                        createdInvoiceItemIds.Contains(item.Id));
                })
                .ToList();

            var allocationDrafts = responseItems
                .Select(x => new BulkPaymentAllocationDraftResponse(x.InvoiceId, x.InvoiceOutstandingAmount))
                .ToList();

            var response = new BulkCreateInvoicesFromPaymentPlanItemsResponse(
                plan.Id,
                enrollment.Id,
                enrollment.StudentId,
                student?.FullName,
                enrollment.ClassId,
                classroom?.Name,
                allocationDrafts.Sum(x => x.Amount),
                responseItems.Count,
                responseItems,
                allocationDrafts);

            return Result<BulkCreateInvoicesFromPaymentPlanItemsResponse>.Success(response, 201);
        }

        private static Invoice CreateInvoice(
            long enrollmentId,
            EnrollmentPaymentPlanItem item,
            DateTimeOffset now,
            string? notes)
        {
            var invoice = new Invoice
            {
                EnrollmentId = enrollmentId,
                PaymentPlanItem = item,
                PaymentPlanItemId = item.Id,
                InvoiceNo = $"INV-{now:yyyyMMddHHmmssfff}-{item.Id}",
                IssuedAt = now,
                DueDate = item.DueDate,
                SubtotalAmount = item.Amount,
                DiscountAmount = 0,
                TaxAmount = 0,
                TotalAmount = item.Amount,
                PaidAmount = 0,
                OutstandingAmount = item.Amount,
                Status = EInvoiceStatus.Issued,
                Notes = string.IsNullOrWhiteSpace(notes) ? item.Name : notes.Trim(),
                CreatedAt = now
            };

            invoice.Lines.Add(new InvoiceLine
            {
                Invoice = invoice,
                ItemType = EBillingItemType.Tuition,
                Description = item.Name,
                Quantity = 1,
                UnitPrice = item.Amount,
                DiscountAmount = 0,
                LineTotal = item.Amount,
                CreatedAt = now
            });

            return invoice;
        }
    }
}
