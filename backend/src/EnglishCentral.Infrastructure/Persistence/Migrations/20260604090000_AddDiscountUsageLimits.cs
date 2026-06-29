using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishCentral.Infrastructure.Persistence.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260604090000_AddDiscountUsageLimits")]
    public partial class AddDiscountUsageLimits : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE finance.discounts
                    ADD COLUMN IF NOT EXISTS "MaxUsageCount" integer NULL,
                    ADD COLUMN IF NOT EXISTS "UsedCount" integer NOT NULL DEFAULT 0,
                    ADD COLUMN IF NOT EXISTS "MaxUsagePerStudent" integer NULL;

                UPDATE finance.discounts
                SET "Name" = "Code"
                WHERE "Name" IS NULL OR "Name" = '';

                CREATE INDEX IF NOT EXISTS "IX_discounts_UsedCount"
                ON finance.discounts("UsedCount");
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DROP INDEX IF EXISTS finance."IX_discounts_UsedCount";

                ALTER TABLE finance.discounts
                    DROP COLUMN IF EXISTS "MaxUsagePerStudent",
                    DROP COLUMN IF EXISTS "UsedCount",
                    DROP COLUMN IF EXISTS "MaxUsageCount";
                """);
        }
    }
}
