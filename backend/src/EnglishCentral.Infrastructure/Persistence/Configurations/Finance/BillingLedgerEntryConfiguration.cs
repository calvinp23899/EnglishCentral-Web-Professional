using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Finance
{
    public class BillingLedgerEntryConfiguration : IEntityTypeConfiguration<BillingLedgerEntry>
    {
        public void Configure(EntityTypeBuilder<BillingLedgerEntry> builder)
        {
            builder.ToTable("billing_ledger_entries", DatabaseSchemas.Finance);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.EnrollmentId);
            builder.HasIndex(x => x.InvoiceId);
            builder.HasIndex(x => x.PaymentId);
            builder.HasIndex(x => x.Type);
            builder.HasIndex(x => x.OccurredAt);
            builder.Property(x => x.Type).HasConversion<int>();
            builder.Property(x => x.DebitAmount).HasPrecision(18, 2);
            builder.Property(x => x.CreditAmount).HasPrecision(18, 2);
            builder.Property(x => x.BalanceAfter).HasPrecision(18, 2);
            builder.Property(x => x.Description).HasMaxLength(2000);
            builder.HasOne(x => x.Enrollment).WithMany().HasForeignKey(x => x.EnrollmentId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.Invoice).WithMany().HasForeignKey(x => x.InvoiceId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.Payment).WithMany().HasForeignKey(x => x.PaymentId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.PaymentAllocation).WithMany().HasForeignKey(x => x.PaymentAllocationId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.Refund).WithMany().HasForeignKey(x => x.RefundId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.CreditNote).WithMany().HasForeignKey(x => x.CreditNoteId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}
