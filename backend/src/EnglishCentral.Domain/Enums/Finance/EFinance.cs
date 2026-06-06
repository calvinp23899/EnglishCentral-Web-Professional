namespace EnglishCentral.Domain.Enums.Finance
{
    public enum EBillingPolicyType
    {
        FullPayment = 1,
        Monthly = 2,
        Installment = 3
    }

    /*
     * FullPayment = Tra het
     * Monthly =  Tra hang thang theo thoi gian cua class
     * Installment = theo ky - 2,3,4... ky
     */
    public enum EPaymentPlanType
    {
        FullPayment = 1,
        Monthly = 2,
        Installment = 3
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
        //Card = 3,
        //EWallet = 4
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
        //Giam tien
        FixedAmount = 1,
        //Giam theo %
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
