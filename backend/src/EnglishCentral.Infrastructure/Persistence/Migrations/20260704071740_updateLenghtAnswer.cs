using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishCentral.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class updateLenghtAnswer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Label",
                schema: "exam",
                table: "exam_answer_options",
                type: "character varying(250)",
                maxLength: 250,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Label",
                schema: "exam",
                table: "exam_answer_options",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(250)",
                oldMaxLength: 250);
        }
    }
}
