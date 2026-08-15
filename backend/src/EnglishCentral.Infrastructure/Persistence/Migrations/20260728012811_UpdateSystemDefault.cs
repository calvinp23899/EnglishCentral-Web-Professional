using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishCentral.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSystemDefault : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSystemDefault",
                schema: "crm",
                table: "lead_sources",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSytemDefault",
                schema: "exam",
                table: "exam_types",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSystemDefault",
                schema: "crm",
                table: "lead_sources");

            migrationBuilder.DropColumn(
                name: "IsSytemDefault",
                schema: "exam",
                table: "exam_types");
        }
    }
}
