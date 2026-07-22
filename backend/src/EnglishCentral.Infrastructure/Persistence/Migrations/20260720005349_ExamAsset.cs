using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EnglishCentral.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ExamAsset : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "ExamAssetId",
                schema: "exam",
                table: "exam_stimuli",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "exam_assets",
                schema: "exam",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AssetType = table.Column<int>(type: "integer", nullable: false),
                    Provider = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    BucketName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ObjectKey = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    PublicUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    OriginalFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    Checksum = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: true),
                    MetadataJson = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_exam_assets", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_exam_stimuli_ExamAssetId",
                schema: "exam",
                table: "exam_stimuli",
                column: "ExamAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_exam_assets_AssetType",
                schema: "exam",
                table: "exam_assets",
                column: "AssetType");

            migrationBuilder.CreateIndex(
                name: "IX_exam_assets_CreatedAt",
                schema: "exam",
                table: "exam_assets",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_exam_assets_IsDeleted",
                schema: "exam",
                table: "exam_assets",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_exam_assets_Provider",
                schema: "exam",
                table: "exam_assets",
                column: "Provider");

            migrationBuilder.CreateIndex(
                name: "IX_exam_assets_Provider_BucketName_ObjectKey",
                schema: "exam",
                table: "exam_assets",
                columns: new[] { "Provider", "BucketName", "ObjectKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_exam_assets_PublicId",
                schema: "exam",
                table: "exam_assets",
                column: "PublicId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_exam_assets_Status",
                schema: "exam",
                table: "exam_assets",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_exam_stimuli_exam_assets_ExamAssetId",
                schema: "exam",
                table: "exam_stimuli",
                column: "ExamAssetId",
                principalSchema: "exam",
                principalTable: "exam_assets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_exam_stimuli_exam_assets_ExamAssetId",
                schema: "exam",
                table: "exam_stimuli");

            migrationBuilder.DropTable(
                name: "exam_assets",
                schema: "exam");

            migrationBuilder.DropIndex(
                name: "IX_exam_stimuli_ExamAssetId",
                schema: "exam",
                table: "exam_stimuli");

            migrationBuilder.DropColumn(
                name: "ExamAssetId",
                schema: "exam",
                table: "exam_stimuli");
        }
    }
}
