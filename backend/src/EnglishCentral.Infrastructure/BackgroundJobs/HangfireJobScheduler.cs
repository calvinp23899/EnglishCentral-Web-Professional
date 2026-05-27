using EnglishCentral.Infrastructure.BackgroundJobs.Billing;
using Hangfire;

namespace EnglishCentral.Infrastructure.BackgroundJobs
{
    public static class HangfireJobScheduler
    {
        public static void ScheduleRecurringJobs()
        {
            RecurringJob.AddOrUpdate<OverdueDetectionJob>(
                "billing-overdue-detection",
                job => job.ExecuteAsync(CancellationToken.None),
                "0 1 * * *");

            RecurringJob.AddOrUpdate<AutoGenerateInvoiceJob>(
                "billing-auto-generate-invoice",
                job => job.ExecuteAsync(CancellationToken.None),
                "0 8 * * *");
        }
    }
}
