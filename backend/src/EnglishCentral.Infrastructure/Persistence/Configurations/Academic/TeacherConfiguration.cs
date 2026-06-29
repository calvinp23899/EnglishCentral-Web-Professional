using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Academic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Academic
{
    public class TeacherConfiguration : IEntityTypeConfiguration<Teacher>
    {
        public void Configure(EntityTypeBuilder<Teacher> builder)
        {
            builder.ToTable("teachers", DatabaseSchemas.Academic);

            // === Keys ===
            builder.HasKey(x => x.Id);

            // === Indexes ===
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.TeacherCode).IsUnique();
            builder.HasIndex(x => x.UserId).IsUnique();
            builder.HasIndex(x => x.Email);
            builder.HasIndex(x => x.NationalId);

            // === Identity ===
            builder.Property(x => x.TeacherCode)
                .HasMaxLength(50)
                .IsRequired();

            // === Basic Info ===
            builder.Property(x => x.FullName)
                .HasMaxLength(255)
                .IsRequired();
            builder.Property(x => x.Email)
                .HasMaxLength(255);
            builder.Property(x => x.PhoneNumber)
                .HasMaxLength(20);
            builder.Property(x => x.Address)
                .HasMaxLength(500);
            builder.Property(x => x.Gender)
                .HasConversion<int>();

            // === National ID ===
            builder.Property(x => x.NationalId)
                .HasMaxLength(50);
            builder.Property(x => x.NationalIdIssuedPlace)
                .HasMaxLength(255);

            // === Professional ===
            builder.Property(x => x.Specialization)
                .HasMaxLength(255);
            builder.Property(x => x.Bio)
                .HasMaxLength(2000);
            builder.Property(x => x.Degree)
                .HasMaxLength(255);
            builder.Property(x => x.CertificationsJson)
                .HasConversion(
                    value => JsonSerializer.Serialize(value, (JsonSerializerOptions?)null),
                    value => JsonSerializer.Deserialize<List<string>>(value, (JsonSerializerOptions?)null))
                .HasColumnType("jsonb")
                .HasColumnName("certifications");

            // === Employment ===
            builder.Property(x => x.ContractType)
                .HasConversion<int>();
            builder.Property(x => x.Status)
                .HasConversion<int>();

            // === Payroll ===
            builder.Property(x => x.SalaryType)
                .HasConversion<int>();
            builder.Property(x => x.BaseSalary)
                .HasColumnType("numeric(18,2)");
            builder.Property(x => x.HourlyRate)
                .HasColumnType("numeric(18,2)");
            builder.Property(x => x.BankAccountNumber)
                .HasMaxLength(50);
            builder.Property(x => x.BankName)
                .HasMaxLength(255);
            builder.Property(x => x.TaxCode)
                .HasMaxLength(50);

            // === Relationships ===
            builder.HasOne(x => x.User)
                .WithOne()
                .HasForeignKey<Teacher>(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
