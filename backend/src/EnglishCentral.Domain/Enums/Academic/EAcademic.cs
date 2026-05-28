namespace EnglishCentral.Domain.Enums.Academic
{
    public enum EGender
    {
        Male = 1,
        Female = 2,
        Other = 3
    }

    public enum EStatus
    {
        Active = 1,
        Inactive = 2,
    }

    public enum ETeacherStatus
    {
        Active = 1,
        Inactive = 2,
        Suspended = 3,
        Resigned = 4
    }

    public enum EClassStatus
    {
        Draft = 1,
        Open = 2,
        Ongoing = 3,
        Completed = 4,
        Cancelled = 5
    }

    public enum EEnrollmentStatus
    {
        Active = 1,
        Dropped = 2,
        Transferred = 3,
        Completed = 4
    }

    public enum EAttendanceStatus
    {
        Present = 1,
        Late = 2,
        Absent = 3,
        Excused = 4
    }

    public enum ESessionStatus
    {
        Scheduled = 1,
        Completed = 2,
        Cancelled = 3,
        Rescheduled = 4
    }

    public enum ECourseLevel
    {
        Beginner = 1,
        Elementary = 2,
        PreIntermediate = 3,
        Intermediate = 4,
        UpperIntermediate = 5,
        Advanced = 6,
        IELTSFoundation = 7,
        IELTSTarget5 = 8,
        IELTSTarget65 = 9,
        IELTSTarget75 = 10,
        TOEICFoundation = 11,
        TOEIC650 = 12,
        TOEIC850 = 13
    }

    public enum EContractType
    {
        FullTime,
        PartTime,
        Freelance
    }
    public enum ESalaryType
    {
        Fixed,
        Hourly,
        PerSession
    }

    public enum EBillingPolicyType
    {
        FullPayment = 1,
        Monthly = 2,
        Installment = 3,
        Custom = 4
    }

    public enum EPaymentPlanType
    {
        FullPayment = 1,
        Monthly = 2,
        Installment = 3,
        Custom = 4
    }

    public enum EPaymentPlanStatus
    {
        Draft = 1,
        Active = 2,
        Completed = 3,
        Cancelled = 4
    }

    public enum EPaymentPlanItemStatus
    {
        Pending = 1,
        Invoiced = 2,
        Paid = 3,
        Overdue = 4,
        Cancelled = 5
    }

    public enum EInvoiceStatus
    {
        Draft = 1,
        Issued = 2,
        PartiallyPaid = 3,
        Paid = 4,
        Overdue = 5,
        Cancelled = 6
    }

    public enum EBillingItemType
    {
        Tuition = 1,
        MaterialFee = 2,
        ExamFee = 3,
        RegistrationFee = 4,
        Adjustment = 5,
        Discount = 6
    }

    public enum EPaymentMethod
    {
        Cash = 1,
        BankTransfer = 2,
        Card = 3,
        EWallet = 4
    }

    public enum EPaymentStatus
    {
        Pending = 1,
        Completed = 2,
        Failed = 3,
        Cancelled = 4,
        Refunded = 5
    }

    public enum EDiscountType
    {
        FixedAmount = 1,
        Percentage = 2
    }

    public enum ERefundStatus
    {
        Pending = 1,
        Completed = 2,
        Cancelled = 3
    }

    public enum ERefundMethod
    {
        Cash = 1,
        BankTransfer = 2,
        Card = 3,
        EWallet = 4
    }

    public enum ECreditNoteStatus
    {
        Open = 1,
        PartiallyApplied = 2,
        Applied = 3,
        Cancelled = 4
    }

    public enum EBillingLedgerEntryType
    {
        InvoiceIssued = 1,
        PaymentReceived = 2,
        PaymentAllocated = 3,
        InvoicePaid = 4,
        PaymentCancelled = 5,
        RefundIssued = 6,
        CreditNoteIssued = 7,
        CreditNoteApplied = 8,
        InvoiceCancelled = 9,
        DiscountApplied = 10
    }
}
