using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Finance
{
    public class CreditNoteConfiguration : IEntityTypeConfiguration<CreditNote>
    {
        public void Configure(EntityTypeBuilder<CreditNote> builder)
        {
            builder.ToTable("credit_notes", DatabaseSchemas.Finance);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.CreditNoteNo).IsUnique();
            builder.HasIndex(x => x.StudentId);
            builder.HasIndex(x => x.EnrollmentId);
            builder.HasIndex(x => x.InvoiceId);
            builder.HasIndex(x => x.Status);
            builder.Property(x => x.CreditNoteNo).HasMaxLength(50).IsRequired();
            builder.Property(x => x.Amount).HasPrecision(18, 2);
            builder.Property(x => x.AppliedAmount).HasPrecision(18, 2);
            builder.Property(x => x.RemainingAmount).HasPrecision(18, 2);
            builder.Property(x => x.Status).HasConversion<int>();
            builder.Property(x => x.Reason).HasMaxLength(1000).IsRequired();
            builder.Property(x => x.Notes).HasMaxLength(2000);
            builder.HasOne(x => x.Student).WithMany().HasForeignKey(x => x.StudentId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.Enrollment).WithMany().HasForeignKey(x => x.EnrollmentId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.Invoice).WithMany().HasForeignKey(x => x.InvoiceId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}
