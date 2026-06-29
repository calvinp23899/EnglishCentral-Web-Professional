namespace EnglishCentral.Infrastructure.BackgroundJobs.Billing
{
    internal static class BillingJobClock
    {
        public static DateOnly Today()
        {
            var timeZone = GetBusinessTimeZone();
            return DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, timeZone).DateTime);
        }

        private static TimeZoneInfo GetBusinessTimeZone()
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            }
            catch (TimeZoneNotFoundException)
            {
                return TimeZoneInfo.FindSystemTimeZoneById("Asia/Bangkok");
            }
        }
    }
}
