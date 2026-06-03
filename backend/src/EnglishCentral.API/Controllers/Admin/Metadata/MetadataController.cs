using EnglishCentral.Application.Features.Identity.Queries.GetRoles;
using EnglishCentral.Contracts.Responses.Metadata;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Domain.Enums.Finance;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Metadata
{
    [Route("api/admin/metadata/")]
    [ApiController]
    public class MetadataController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public MetadataController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("status")]
        public IActionResult GetMetadataStatus()
        {
            var result = GetEnumMetadata<EStatus>();
            return Ok(result);
        }

        [HttpGet("gender-status")]
        public IActionResult GetMetadataGenderStatus()
        {
            var result = GetEnumMetadata<EGender>();
            return Ok(result);
        }

        [HttpGet("get-teacher-status")]
        public IActionResult GetMetadataTeacherStatus()
        {
            var result = GetEnumMetadata<ETeacherStatus>();
            return Ok(result);
        }

        [HttpGet("get-contract-type")]
        public IActionResult GetMetadataContractType()
        {
            var result = GetEnumMetadata<EContractType>();
            return Ok(result);
        }

        [HttpGet("get-salary-type")]
        public IActionResult GetMetadataSalaryType()
        {
            var result = GetEnumMetadata<ESalaryType>();
            return Ok(result);
        }

        [HttpGet("get-class-status")]
        public IActionResult GetMetadataClassStatus() => Ok(GetEnumMetadata<EClassStatus>());

        [HttpGet("get-enrollment-status")]
        public IActionResult GetMetadataEnrollmentStatus() => Ok(GetEnumMetadata<EEnrollmentStatus>());

        [HttpGet("get-attendance-status")]
        public IActionResult GetMetadataAttendanceStatus() => Ok(GetEnumMetadata<EAttendanceStatus>());

        [HttpGet("get-session-status")]
        public IActionResult GetMetadataSessionStatus() => Ok(GetEnumMetadata<ESessionStatus>());

        [HttpGet("get-course-level")]
        public IActionResult GetMetadataCourseLevel() => Ok(GetEnumMetadata<ECourseLevel>());

        [HttpGet("get-teacher-sort-column")]
        public IActionResult GetMetadataTeacherSortColumn() => Ok(GetEnumMetadata<EColumnSortGetTeacher>());

        [HttpGet("get-sort-order")]
        public IActionResult GetMetadataSortOrder() => Ok(GetEnumMetadata<EOrderSort>());

        [HttpGet("get-billing-policy-type")]
        public IActionResult GetMetadataBillingPolicyType()
        {
            var result = Enum.GetValues<EBillingPolicyType>()
               .Where(x => x != EBillingPolicyType.Monthly)
               .Select(x => new MetadataOptionResponse(
                   Label: x.ToString(),
                   Value: x.ToString(),
                   Code: (int)x))
               .ToList();
            return Ok(result);
        }

        [HttpGet("get-payment-plan-type")]
        public IActionResult GetMetadataPaymentPlanType() => Ok(GetEnumMetadata<EPaymentPlanType>());

        [HttpGet("get-payment-plan-status")]
        public IActionResult GetMetadataPaymentPlanStatus() => Ok(GetEnumMetadata<EPaymentPlanStatus>());

        [HttpGet("get-payment-plan-item-status")]
        public IActionResult GetMetadataPaymentPlanItemStatus() => Ok(GetEnumMetadata<EPaymentPlanItemStatus>());

        [HttpGet("get-invoice-status")]
        public IActionResult GetMetadataInvoiceStatus() => Ok(GetEnumMetadata<EInvoiceStatus>());

        [HttpGet("get-billing-item-type")]
        public IActionResult GetMetadataBillingItemType() => Ok(GetEnumMetadata<EBillingItemType>());

        [HttpGet("get-payment-method")]
        public IActionResult GetMetadataPaymentMethod() => Ok(GetEnumMetadata<EPaymentMethod>());

        [HttpGet("get-payment-status")]
        public IActionResult GetMetadataPaymentStatus() => Ok(GetEnumMetadata<EPaymentStatus>());

        [HttpGet("get-discount-type")]
        public IActionResult GetMetadataDiscountType() => Ok(GetEnumMetadata<EDiscountType>());

        [HttpGet("get-refund-status")]
        public IActionResult GetMetadataRefundStatus() => Ok(GetEnumMetadata<ERefundStatus>());

        [HttpGet("get-refund-method")]
        public IActionResult GetMetadataRefundMethod() => Ok(GetEnumMetadata<ERefundMethod>());

        [HttpGet("get-credit-note-status")]
        public IActionResult GetMetadataCreditNoteStatus() => Ok(GetEnumMetadata<ECreditNoteStatus>());

        [HttpGet("get-billing-ledger-entry-type")]
        public IActionResult GetMetadataBillingLedgerEntryType() => Ok(GetEnumMetadata<EBillingLedgerEntryType>());

        [HttpGet("role-dropdown")]
        public async Task<IActionResult> GetRoleDropdown(CancellationToken ct)
        {
            var result = await _mediator.Send(new GetRoleQuery(), ct);
            return StatusCode(result.StatusCode, result.Data);
        }
    }
}
