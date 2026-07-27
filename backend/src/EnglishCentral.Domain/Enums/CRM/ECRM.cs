namespace EnglishCentral.Domain.Enums.CRM
{
    public enum ELeadSourceChannel
    {
        Ads = 1,
        Organic = 2,
        Referral = 3,
        Offline = 4,
        Partner = 5,
        Other = 6
    }

    public enum ELeadStatus
    {
        New = 1,
        Contacted = 2,
        Interested = 3,
        TrialScheduled = 4,
        Converted = 5,
        Lost = 6
    }

    public enum ELeadLostReason
    {
        TooExpensive = 1,
        NoResponse = 2,
        ScheduleNotFit = 3,
        ChoseCompetitor = 4,
        NotReady = 5,
        InvalidContact = 6,
        Other = 7
    }

    public enum ELeadActivityType
    {
        Call = 1,
        Message = 2,
        Zalo = 3,
        Email = 4,
        Meeting = 5,
        Trial = 6,
        Note = 7
    }
}
