using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Finance
{
    public class CreditNoteApplicationConfiguration : IEntityTypeConfiguration<CreditNoteApplication>
    {
        public void Configure(EntityTypeBuilder<CreditNoteApplication> builder)
        {
            builder.ToTable("credit_note_applications", DatabaseSchemas.Finance);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.CreditNoteId);
            builder.HasIndex(x => x.InvoiceId);
            builder.Property(x => x.Amount).HasPrecision(18, 2);
            builder.HasOne(x => x.CreditNote).WithMany(x => x.Applications).HasForeignKey(x => x.CreditNoteId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(x => x.Invoice).WithMany().HasForeignKey(x => x.InvoiceId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}
