using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishCentral.Infrastructure.Persistence.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260526000000_RemoveAcademicTerm")]
    public partial class RemoveAcademicTerm : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_classes_academic_terms_AcademicTermId",
                schema: "academic",
                table: "classes");

            migrationBuilder.DropIndex(
                name: "IX_classes_AcademicTermId",
                schema: "academic",
                table: "classes");

            migrationBuilder.DropColumn(
                name: "AcademicTermId",
                schema: "academic",
                table: "classes");

            migrationBuilder.DropTable(
                name: "academic_terms",
                schema: "academic");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "academic_terms",
                schema: "academic",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", Npgsql.EntityFrameworkCore.PostgreSQL.Metadata.NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_academic_terms", x => x.Id);
                });

            migrationBuilder.AddColumn<long>(
                name: "AcademicTermId",
                schema: "academic",
                table: "classes",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_academic_terms_Name",
                schema: "academic",
                table: "academic_terms",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_academic_terms_PublicId",
                schema: "academic",
                table: "academic_terms",
                column: "PublicId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_classes_AcademicTermId",
                schema: "academic",
                table: "classes",
                column: "AcademicTermId");

            migrationBuilder.AddForeignKey(
                name: "FK_classes_academic_terms_AcademicTermId",
                schema: "academic",
                table: "classes",
                column: "AcademicTermId",
                principalSchema: "academic",
                principalTable: "academic_terms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
