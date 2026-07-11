using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishCentral.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddExamAttemptMode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Mode",
                schema: "exam",
                table: "exam_attempts",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateIndex(
                name: "IX_exam_attempts_Mode",
                schema: "exam",
                table: "exam_attempts",
                column: "Mode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_exam_attempts_Mode",
                schema: "exam",
                table: "exam_attempts");

            migrationBuilder.DropColumn(
                name: "Mode",
                schema: "exam",
                table: "exam_attempts");
        }
    }
}
