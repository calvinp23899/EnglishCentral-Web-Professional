namespace EnglishCentral.Domain.Enums.CRM
{
    public enum ELeadSourceChannel
    {
        /// <summary>
        /// Quảng cáo trả phí
        /// </summary>
        Ads = 1,
        /// <summary>
        /// Tự nhiên, không trả tiền quảng cáo
        /// </summary>
        Organic = 2,
        /// <summary>
        /// Được giới thiệu
        /// </summary>
        Referral = 3,
        /// <summary>
        /// Nguồn offline
        /// </summary>
        Offline = 4,
        /// <summary>
        /// Đến từ đối tác
        /// </summary>
        Partner = 5,
        /// <summary>
        /// Nguồn khác
        /// </summary>
        Other = 6
    }

    public enum ELeadStatus
    {
        /// <summary>
        /// Lead mới, chưa được xử lý
        /// </summary>
        New = 1,
        /// <summary>
        /// Đã liên hệ với Lead
        /// </summary>
        Contacted = 2,
        /// <summary>
        /// Lead có quan tâm đến sản phẩm/dịch vụ
        /// </summary>
        Interested = 3,
        /// <summary>
        /// Đã đặt lịch học/dùng thử
        /// </summary>
        TrialScheduled = 4,
        /// <summary>
        /// Lead đã chuyển thành khách hàng/học viên chính thức
        /// </summary>
        Converted = 5,
        /// <summary>
        /// Mất liên lạc / Huỷ tương tác lead
        /// </summary>
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
