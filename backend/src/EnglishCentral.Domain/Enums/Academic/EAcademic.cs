namespace EnglishCentral.Domain.Enums.Academic
{
    public enum Gender
    {
        Male = 1,
        Female = 2,
        Other = 3
    }

    public enum StudentStatus
    {
        Active = 1,
        Inactive = 2,
        Suspended = 3,
        Graduated = 4
    }

    public enum TeacherStatus
    {
        Active = 1,
        Inactive = 2,
        Suspended = 3,
        Resigned = 4
    }

    public enum ClassStatus
    {
        Draft = 1,
        Open = 2,
        Ongoing = 3,
        Completed = 4,
        Cancelled = 5
    }

    public enum EnrollmentStatus
    {
        Active = 1,
        Dropped = 2,
        Transferred = 3,
        Completed = 4
    }

    public enum AttendanceStatus
    {
        Present = 1,
        Late = 2,
        Absent = 3,
        Excused = 4
    }

    public enum SessionStatus
    {
        Scheduled = 1,
        Completed = 2,
        Cancelled = 3,
        Rescheduled = 4
    }

    public enum CourseLevel
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

    public enum ContractType
    {
        FullTime,
        PartTime,
        Freelance
    }
    public enum SalaryType
    {
        Fixed,
        Hourly,
        PerSession
    }

    public enum BillingPolicyType
    {
        FullPayment = 1,
        Monthly = 2,
        Installment = 3,
        Custom = 4
    }

    public enum PaymentPlanType
    {
        FullPayment = 1,
        Monthly = 2,
        Installment = 3,
        Custom = 4
    }

    public enum PaymentPlanStatus
    {
        Draft = 1,
        Active = 2,
        Completed = 3,
        Cancelled = 4
    }

    public enum PaymentPlanItemStatus
    {
        Pending = 1,
        Invoiced = 2,
        Paid = 3,
        Overdue = 4,
        Cancelled = 5
    }

    public enum InvoiceStatus
    {
        Draft = 1,
        Issued = 2,
        PartiallyPaid = 3,
        Paid = 4,
        Overdue = 5,
        Cancelled = 6
    }

    public enum BillingItemType
    {
        Tuition = 1,
        MaterialFee = 2,
        ExamFee = 3,
        RegistrationFee = 4,
        Adjustment = 5
    }

    public enum PaymentMethod
    {
        Cash = 1,
        BankTransfer = 2,
        Card = 3,
        EWallet = 4
    }

    public enum PaymentStatus
    {
        Pending = 1,
        Completed = 2,
        Failed = 3,
        Cancelled = 4,
        Refunded = 5
    }
}
