using System;
using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EnglishCentral.Infrastructure.Persistence.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260527083000_AddFinanceBilling")]
    public partial class AddFinanceBilling : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(name: "finance");

            migrationBuilder.CreateTable(
                name: "billing_policies",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    NumberOfInstallments = table.Column<int>(type: "integer", nullable: true),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    PublicId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table => table.PrimaryKey("PK_billing_policies", x => x.Id));

            migrationBuilder.AddColumn<long>(
                name: "DefaultBillingPolicyId",
                schema: "academic",
                table: "courses",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "BillingPolicyId",
                schema: "academic",
                table: "classes",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "enrollment_payment_plans",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EnrollmentId = table.Column<long>(type: "bigint", nullable: false),
                    BillingPolicyId = table.Column<long>(type: "bigint", nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    NumberOfInstallments = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    PublicId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_enrollment_payment_plans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_enrollment_payment_plans_billing_policies_BillingPolicyId",
                        column: x => x.BillingPolicyId,
                        principalSchema: "finance",
                        principalTable: "billing_policies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_enrollment_payment_plans_enrollments_EnrollmentId",
                        column: x => x.EnrollmentId,
                        principalSchema: "academic",
                        principalTable: "enrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "payments",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    PaymentNo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PaidAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Method = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ReferenceCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PayerName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    PayerPhone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    PublicId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_payments_students_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "academic",
                        principalTable: "students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "enrollment_payment_plan_items",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PaymentPlanId = table.Column<long>(type: "bigint", nullable: false),
                    SequenceNumber = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    DueDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    PublicId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_enrollment_payment_plan_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_enrollment_payment_plan_items_enrollment_payment_plans_PaymentPlanId",
                        column: x => x.PaymentPlanId,
                        principalSchema: "finance",
                        principalTable: "enrollment_payment_plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "receipts",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PaymentId = table.Column<long>(type: "bigint", nullable: false),
                    ReceiptNo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IssuedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    PublicId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_receipts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_receipts_payments_PaymentId",
                        column: x => x.PaymentId,
                        principalSchema: "finance",
                        principalTable: "payments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "invoices",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EnrollmentId = table.Column<long>(type: "bigint", nullable: false),
                    PaymentPlanItemId = table.Column<long>(type: "bigint", nullable: true),
                    InvoiceNo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IssuedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    DueDate = table.Column<DateOnly>(type: "date", nullable: false),
                    SubtotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TaxAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PaidAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    OutstandingAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    PublicId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_invoices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_invoices_enrollment_payment_plan_items_PaymentPlanItemId",
                        column: x => x.PaymentPlanItemId,
                        principalSchema: "finance",
                        principalTable: "enrollment_payment_plan_items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_invoices_enrollments_EnrollmentId",
                        column: x => x.EnrollmentId,
                        principalSchema: "academic",
                        principalTable: "enrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "invoice_lines",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InvoiceId = table.Column<long>(type: "bigint", nullable: false),
                    ItemType = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    LineTotal = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PublicId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_invoice_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_invoice_lines_invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "finance",
                        principalTable: "invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "payment_allocations",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PaymentId = table.Column<long>(type: "bigint", nullable: false),
                    InvoiceId = table.Column<long>(type: "bigint", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    AllocatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    PublicId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_payment_allocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_payment_allocations_invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "finance",
                        principalTable: "invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_payment_allocations_payments_PaymentId",
                        column: x => x.PaymentId,
                        principalSchema: "finance",
                        principalTable: "payments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            CreateIndexesAndPolicyFks(migrationBuilder);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_classes_billing_policies_BillingPolicyId", schema: "academic", table: "classes");
            migrationBuilder.DropForeignKey(name: "FK_courses_billing_policies_DefaultBillingPolicyId", schema: "academic", table: "courses");
            migrationBuilder.DropTable(name: "invoice_lines", schema: "finance");
            migrationBuilder.DropTable(name: "payment_allocations", schema: "finance");
            migrationBuilder.DropTable(name: "receipts", schema: "finance");
            migrationBuilder.DropTable(name: "invoices", schema: "finance");
            migrationBuilder.DropTable(name: "payments", schema: "finance");
            migrationBuilder.DropTable(name: "enrollment_payment_plan_items", schema: "finance");
            migrationBuilder.DropTable(name: "enrollment_payment_plans", schema: "finance");
            migrationBuilder.DropIndex(name: "IX_classes_BillingPolicyId", schema: "academic", table: "classes");
            migrationBuilder.DropIndex(name: "IX_courses_DefaultBillingPolicyId", schema: "academic", table: "courses");
            migrationBuilder.DropColumn(name: "BillingPolicyId", schema: "academic", table: "classes");
            migrationBuilder.DropColumn(name: "DefaultBillingPolicyId", schema: "academic", table: "courses");
            migrationBuilder.DropTable(name: "billing_policies", schema: "finance");
        }

        private static void CreateIndexesAndPolicyFks(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(name: "IX_billing_policies_IsActive", schema: "finance", table: "billing_policies", column: "IsActive");
            migrationBuilder.CreateIndex(name: "IX_billing_policies_Name", schema: "finance", table: "billing_policies", column: "Name", unique: true);
            migrationBuilder.CreateIndex(name: "IX_billing_policies_PublicId", schema: "finance", table: "billing_policies", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_billing_policies_Type", schema: "finance", table: "billing_policies", column: "Type");
            migrationBuilder.CreateIndex(name: "IX_courses_DefaultBillingPolicyId", schema: "academic", table: "courses", column: "DefaultBillingPolicyId");
            migrationBuilder.CreateIndex(name: "IX_classes_BillingPolicyId", schema: "academic", table: "classes", column: "BillingPolicyId");
            migrationBuilder.CreateIndex(name: "IX_enrollment_payment_plans_BillingPolicyId", schema: "finance", table: "enrollment_payment_plans", column: "BillingPolicyId");
            migrationBuilder.CreateIndex(name: "IX_enrollment_payment_plans_EnrollmentId", schema: "finance", table: "enrollment_payment_plans", column: "EnrollmentId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_enrollment_payment_plans_PublicId", schema: "finance", table: "enrollment_payment_plans", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_enrollment_payment_plans_Status", schema: "finance", table: "enrollment_payment_plans", column: "Status");
            migrationBuilder.CreateIndex(name: "IX_payments_PaidAt", schema: "finance", table: "payments", column: "PaidAt");
            migrationBuilder.CreateIndex(name: "IX_payments_PaymentNo", schema: "finance", table: "payments", column: "PaymentNo", unique: true);
            migrationBuilder.CreateIndex(name: "IX_payments_PublicId", schema: "finance", table: "payments", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_payments_Status", schema: "finance", table: "payments", column: "Status");
            migrationBuilder.CreateIndex(name: "IX_payments_StudentId", schema: "finance", table: "payments", column: "StudentId");
            migrationBuilder.CreateIndex(name: "IX_enrollment_payment_plan_items_DueDate", schema: "finance", table: "enrollment_payment_plan_items", column: "DueDate");
            migrationBuilder.CreateIndex(name: "IX_enrollment_payment_plan_items_PaymentPlanId_SequenceNumber", schema: "finance", table: "enrollment_payment_plan_items", columns: new[] { "PaymentPlanId", "SequenceNumber" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_enrollment_payment_plan_items_PublicId", schema: "finance", table: "enrollment_payment_plan_items", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_enrollment_payment_plan_items_Status", schema: "finance", table: "enrollment_payment_plan_items", column: "Status");
            migrationBuilder.CreateIndex(name: "IX_invoices_DueDate", schema: "finance", table: "invoices", column: "DueDate");
            migrationBuilder.CreateIndex(name: "IX_invoices_EnrollmentId", schema: "finance", table: "invoices", column: "EnrollmentId");
            migrationBuilder.CreateIndex(name: "IX_invoices_InvoiceNo", schema: "finance", table: "invoices", column: "InvoiceNo", unique: true);
            migrationBuilder.CreateIndex(name: "IX_invoices_PaymentPlanItemId", schema: "finance", table: "invoices", column: "PaymentPlanItemId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_invoices_PublicId", schema: "finance", table: "invoices", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_invoices_Status", schema: "finance", table: "invoices", column: "Status");
            migrationBuilder.CreateIndex(name: "IX_invoice_lines_InvoiceId", schema: "finance", table: "invoice_lines", column: "InvoiceId");
            migrationBuilder.CreateIndex(name: "IX_invoice_lines_ItemType", schema: "finance", table: "invoice_lines", column: "ItemType");
            migrationBuilder.CreateIndex(name: "IX_invoice_lines_PublicId", schema: "finance", table: "invoice_lines", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_payment_allocations_InvoiceId", schema: "finance", table: "payment_allocations", column: "InvoiceId");
            migrationBuilder.CreateIndex(name: "IX_payment_allocations_PaymentId", schema: "finance", table: "payment_allocations", column: "PaymentId");
            migrationBuilder.CreateIndex(name: "IX_payment_allocations_PublicId", schema: "finance", table: "payment_allocations", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_receipts_PaymentId", schema: "finance", table: "receipts", column: "PaymentId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_receipts_PublicId", schema: "finance", table: "receipts", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_receipts_ReceiptNo", schema: "finance", table: "receipts", column: "ReceiptNo", unique: true);

            migrationBuilder.AddForeignKey(name: "FK_classes_billing_policies_BillingPolicyId", schema: "academic", table: "classes", column: "BillingPolicyId", principalSchema: "finance", principalTable: "billing_policies", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(name: "FK_courses_billing_policies_DefaultBillingPolicyId", schema: "academic", table: "courses", column: "DefaultBillingPolicyId", principalSchema: "finance", principalTable: "billing_policies", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
        }
    }
}
