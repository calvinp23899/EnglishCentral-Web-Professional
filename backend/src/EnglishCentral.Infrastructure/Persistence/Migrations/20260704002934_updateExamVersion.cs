using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishCentral.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class updateExamVersion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_exam_versions_ExamTemplateId_VersionCode",
                schema: "exam",
                table: "exam_versions");

            migrationBuilder.DropColumn(
                name: "VersionCode",
                schema: "exam",
                table: "exam_versions");

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                schema: "exam",
                table: "exam_versions",
                type: "character varying(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_exam_versions_ExamTemplateId_Slug",
                schema: "exam",
                table: "exam_versions",
                columns: new[] { "ExamTemplateId", "Slug" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_exam_versions_ExamTemplateId_Slug",
                schema: "exam",
                table: "exam_versions");

            migrationBuilder.DropColumn(
                name: "Slug",
                schema: "exam",
                table: "exam_versions");

            migrationBuilder.AddColumn<string>(
                name: "VersionCode",
                schema: "exam",
                table: "exam_versions",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_exam_versions_ExamTemplateId_VersionCode",
                schema: "exam",
                table: "exam_versions",
                columns: new[] { "ExamTemplateId", "VersionCode" },
                unique: true);
        }
    }
}
