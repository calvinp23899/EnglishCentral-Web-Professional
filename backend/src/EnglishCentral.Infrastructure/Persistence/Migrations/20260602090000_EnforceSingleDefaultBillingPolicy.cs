using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishCentral.Infrastructure.Persistence.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260602090000_EnforceSingleDefaultBillingPolicy")]
    public partial class EnforceSingleDefaultBillingPolicy : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE finance.billing_policies
                SET "IsDefault" = FALSE
                WHERE "IsDefault" = TRUE
                  AND "IsDeleted" = FALSE
                  AND "Id" <> (
                      SELECT "Id"
                      FROM finance.billing_policies
                      WHERE "IsDefault" = TRUE AND "IsDeleted" = FALSE
                      ORDER BY "CreatedAt" DESC, "Id" DESC
                      LIMIT 1
                  );

                CREATE UNIQUE INDEX IF NOT EXISTS "IX_billing_policies_IsDefault"
                ON finance.billing_policies ("IsDefault")
                WHERE "IsDefault" = TRUE AND "IsDeleted" = FALSE;
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DROP INDEX IF EXISTS finance."IX_billing_policies_IsDefault";
                """);
        }
    }
}
