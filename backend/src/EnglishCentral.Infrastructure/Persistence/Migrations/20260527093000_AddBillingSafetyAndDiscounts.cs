using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishCentral.Infrastructure.Persistence.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260527093000_AddBillingSafetyAndDiscounts")]
    public partial class AddBillingSafetyAndDiscounts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                CREATE TABLE IF NOT EXISTS finance.discounts (
                    "Id" bigserial PRIMARY KEY,
                    "Code" varchar(50) NOT NULL UNIQUE,
                    "Name" varchar(255) NOT NULL,
                    "Type" integer NOT NULL,
                    "Value" numeric(18,2) NOT NULL,
                    "ValidFrom" date NULL,
                    "ValidTo" date NULL,
                    "IsActive" boolean NOT NULL DEFAULT true,
                    "Description" varchar(2000) NULL,
                    "PublicId" uuid NOT NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "CreatedBy" bigint NULL,
                    "UpdatedAt" timestamp with time zone NULL,
                    "UpdatedBy" bigint NULL,
                    "DeletedAt" timestamp with time zone NULL,
                    "DeletedBy" bigint NULL,
                    "IsDeleted" boolean NOT NULL DEFAULT false
                );

                CREATE TABLE IF NOT EXISTS finance.enrollment_discounts (
                    "Id" bigserial PRIMARY KEY,
                    "EnrollmentId" bigint NOT NULL REFERENCES academic.enrollments("Id") ON DELETE RESTRICT,
                    "DiscountId" bigint NULL REFERENCES finance.discounts("Id") ON DELETE RESTRICT,
                    "Name" varchar(255) NOT NULL,
                    "Type" integer NOT NULL,
                    "Value" numeric(18,2) NOT NULL,
                    "Amount" numeric(18,2) NOT NULL,
                    "Reason" varchar(1000) NULL,
                    "PublicId" uuid NOT NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "CreatedBy" bigint NULL,
                    "UpdatedAt" timestamp with time zone NULL,
                    "UpdatedBy" bigint NULL,
                    "DeletedAt" timestamp with time zone NULL,
                    "DeletedBy" bigint NULL,
                    "IsDeleted" boolean NOT NULL DEFAULT false
                );

                CREATE TABLE IF NOT EXISTS finance.invoice_discounts (
                    "Id" bigserial PRIMARY KEY,
                    "InvoiceId" bigint NOT NULL REFERENCES finance.invoices("Id") ON DELETE CASCADE,
                    "EnrollmentDiscountId" bigint NULL REFERENCES finance.enrollment_discounts("Id") ON DELETE RESTRICT,
                    "DiscountId" bigint NULL REFERENCES finance.discounts("Id") ON DELETE RESTRICT,
                    "Name" varchar(255) NOT NULL,
                    "Type" integer NOT NULL,
                    "Value" numeric(18,2) NOT NULL,
                    "Amount" numeric(18,2) NOT NULL,
                    "Reason" varchar(1000) NULL,
                    "PublicId" uuid NOT NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "CreatedBy" bigint NULL,
                    "UpdatedAt" timestamp with time zone NULL,
                    "UpdatedBy" bigint NULL,
                    "DeletedAt" timestamp with time zone NULL,
                    "DeletedBy" bigint NULL,
                    "IsDeleted" boolean NOT NULL DEFAULT false
                );

                CREATE TABLE IF NOT EXISTS finance.refunds (
                    "Id" bigserial PRIMARY KEY,
                    "PaymentId" bigint NOT NULL REFERENCES finance.payments("Id") ON DELETE RESTRICT,
                    "EnrollmentId" bigint NULL REFERENCES academic.enrollments("Id") ON DELETE RESTRICT,
                    "RefundNo" varchar(50) NOT NULL UNIQUE,
                    "Amount" numeric(18,2) NOT NULL,
                    "Status" integer NOT NULL,
                    "Method" integer NOT NULL,
                    "Reason" varchar(1000) NOT NULL,
                    "RequestedAt" timestamp with time zone NOT NULL,
                    "RefundedAt" timestamp with time zone NULL,
                    "ReferenceCode" varchar(100) NULL,
                    "Notes" varchar(2000) NULL,
                    "PublicId" uuid NOT NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "CreatedBy" bigint NULL,
                    "UpdatedAt" timestamp with time zone NULL,
                    "UpdatedBy" bigint NULL,
                    "DeletedAt" timestamp with time zone NULL,
                    "DeletedBy" bigint NULL,
                    "IsDeleted" boolean NOT NULL DEFAULT false
                );

                CREATE TABLE IF NOT EXISTS finance.credit_notes (
                    "Id" bigserial PRIMARY KEY,
                    "StudentId" bigint NOT NULL REFERENCES academic.students("Id") ON DELETE RESTRICT,
                    "EnrollmentId" bigint NULL REFERENCES academic.enrollments("Id") ON DELETE RESTRICT,
                    "InvoiceId" bigint NULL REFERENCES finance.invoices("Id") ON DELETE RESTRICT,
                    "CreditNoteNo" varchar(50) NOT NULL UNIQUE,
                    "Amount" numeric(18,2) NOT NULL,
                    "AppliedAmount" numeric(18,2) NOT NULL,
                    "RemainingAmount" numeric(18,2) NOT NULL,
                    "Status" integer NOT NULL,
                    "Reason" varchar(1000) NOT NULL,
                    "IssuedAt" timestamp with time zone NOT NULL,
                    "Notes" varchar(2000) NULL,
                    "PublicId" uuid NOT NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "CreatedBy" bigint NULL,
                    "UpdatedAt" timestamp with time zone NULL,
                    "UpdatedBy" bigint NULL,
                    "DeletedAt" timestamp with time zone NULL,
                    "DeletedBy" bigint NULL,
                    "IsDeleted" boolean NOT NULL DEFAULT false
                );

                CREATE TABLE IF NOT EXISTS finance.credit_note_applications (
                    "Id" bigserial PRIMARY KEY,
                    "CreditNoteId" bigint NOT NULL REFERENCES finance.credit_notes("Id") ON DELETE CASCADE,
                    "InvoiceId" bigint NOT NULL REFERENCES finance.invoices("Id") ON DELETE RESTRICT,
                    "Amount" numeric(18,2) NOT NULL,
                    "AppliedAt" timestamp with time zone NOT NULL,
                    "PublicId" uuid NOT NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "CreatedBy" bigint NULL,
                    "UpdatedAt" timestamp with time zone NULL,
                    "UpdatedBy" bigint NULL,
                    "DeletedAt" timestamp with time zone NULL,
                    "DeletedBy" bigint NULL,
                    "IsDeleted" boolean NOT NULL DEFAULT false
                );

                CREATE TABLE IF NOT EXISTS finance.billing_ledger_entries (
                    "Id" bigserial PRIMARY KEY,
                    "EnrollmentId" bigint NULL REFERENCES academic.enrollments("Id") ON DELETE RESTRICT,
                    "InvoiceId" bigint NULL REFERENCES finance.invoices("Id") ON DELETE RESTRICT,
                    "PaymentId" bigint NULL REFERENCES finance.payments("Id") ON DELETE RESTRICT,
                    "PaymentAllocationId" bigint NULL REFERENCES finance.payment_allocations("Id") ON DELETE RESTRICT,
                    "RefundId" bigint NULL REFERENCES finance.refunds("Id") ON DELETE RESTRICT,
                    "CreditNoteId" bigint NULL REFERENCES finance.credit_notes("Id") ON DELETE RESTRICT,
                    "Type" integer NOT NULL,
                    "DebitAmount" numeric(18,2) NOT NULL,
                    "CreditAmount" numeric(18,2) NOT NULL,
                    "BalanceAfter" numeric(18,2) NOT NULL,
                    "OccurredAt" timestamp with time zone NOT NULL,
                    "Description" varchar(2000) NULL,
                    "PublicId" uuid NOT NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "CreatedBy" bigint NULL,
                    "UpdatedAt" timestamp with time zone NULL,
                    "UpdatedBy" bigint NULL,
                    "DeletedAt" timestamp with time zone NULL,
                    "DeletedBy" bigint NULL,
                    "IsDeleted" boolean NOT NULL DEFAULT false
                );

                CREATE INDEX IF NOT EXISTS "IX_discounts_PublicId" ON finance.discounts("PublicId");
                CREATE INDEX IF NOT EXISTS "IX_discounts_IsActive" ON finance.discounts("IsActive");
                CREATE INDEX IF NOT EXISTS "IX_enrollment_discounts_EnrollmentId" ON finance.enrollment_discounts("EnrollmentId");
                CREATE INDEX IF NOT EXISTS "IX_invoice_discounts_InvoiceId" ON finance.invoice_discounts("InvoiceId");
                CREATE INDEX IF NOT EXISTS "IX_refunds_PaymentId" ON finance.refunds("PaymentId");
                CREATE INDEX IF NOT EXISTS "IX_credit_notes_StudentId" ON finance.credit_notes("StudentId");
                CREATE INDEX IF NOT EXISTS "IX_credit_note_applications_CreditNoteId" ON finance.credit_note_applications("CreditNoteId");
                CREATE INDEX IF NOT EXISTS "IX_billing_ledger_entries_EnrollmentId" ON finance.billing_ledger_entries("EnrollmentId");
                CREATE INDEX IF NOT EXISTS "IX_billing_ledger_entries_InvoiceId" ON finance.billing_ledger_entries("InvoiceId");
                CREATE INDEX IF NOT EXISTS "IX_billing_ledger_entries_PaymentId" ON finance.billing_ledger_entries("PaymentId");
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DROP TABLE IF EXISTS finance.billing_ledger_entries;
                DROP TABLE IF EXISTS finance.credit_note_applications;
                DROP TABLE IF EXISTS finance.credit_notes;
                DROP TABLE IF EXISTS finance.refunds;
                DROP TABLE IF EXISTS finance.invoice_discounts;
                DROP TABLE IF EXISTS finance.enrollment_discounts;
                DROP TABLE IF EXISTS finance.discounts;
                """);
        }
    }
}
