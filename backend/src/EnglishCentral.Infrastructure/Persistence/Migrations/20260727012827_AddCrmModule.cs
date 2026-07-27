using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EnglishCentral.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCrmModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "crm");

            migrationBuilder.CreateTable(
                name: "lead_sources",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Channel = table.Column<int>(type: "integer", nullable: false),
                    CampaignName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Cost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
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
                    table.PrimaryKey("PK_lead_sources", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "leads",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LeadCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FullName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    LeadSourceId = table.Column<long>(type: "bigint", nullable: false),
                    AssignedToUserId = table.Column<long>(type: "bigint", nullable: true),
                    InterestedCourseId = table.Column<long>(type: "bigint", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    DemandNote = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    UtmSource = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UtmMedium = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UtmCampaign = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ReferrerUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    LandingPageUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    LastContactAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    NextFollowUpAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LostReason = table.Column<int>(type: "integer", nullable: true),
                    LostReasonNote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ConvertedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_leads", x => x.Id);
                    table.ForeignKey(
                        name: "FK_leads_courses_InterestedCourseId",
                        column: x => x.InterestedCourseId,
                        principalSchema: "academic",
                        principalTable: "courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_leads_lead_sources_LeadSourceId",
                        column: x => x.LeadSourceId,
                        principalSchema: "crm",
                        principalTable: "lead_sources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_leads_users_AssignedToUserId",
                        column: x => x.AssignedToUserId,
                        principalSchema: "identity",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "lead_activities",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LeadId = table.Column<long>(type: "bigint", nullable: false),
                    ActivityType = table.Column<int>(type: "integer", nullable: false),
                    Note = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Outcome = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    NextFollowUpAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedByUserId = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_lead_activities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_lead_activities_leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "crm",
                        principalTable: "leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_lead_activities_users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalSchema: "identity",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "lead_conversions",
                schema: "crm",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LeadId = table.Column<long>(type: "bigint", nullable: false),
                    StudentId = table.Column<long>(type: "bigint", nullable: false),
                    EnrollmentId = table.Column<long>(type: "bigint", nullable: true),
                    ConvertedByUserId = table.Column<long>(type: "bigint", nullable: false),
                    ConvertedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    SourceIdSnapshot = table.Column<long>(type: "bigint", nullable: true),
                    SourceNameSnapshot = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ChannelSnapshot = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CourseIdSnapshot = table.Column<long>(type: "bigint", nullable: true),
                    CourseNameSnapshot = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    RevenueSnapshot = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Note = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_lead_conversions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_lead_conversions_enrollments_EnrollmentId",
                        column: x => x.EnrollmentId,
                        principalSchema: "academic",
                        principalTable: "enrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_lead_conversions_leads_LeadId",
                        column: x => x.LeadId,
                        principalSchema: "crm",
                        principalTable: "leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_lead_conversions_students_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "academic",
                        principalTable: "students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_lead_conversions_users_ConvertedByUserId",
                        column: x => x.ConvertedByUserId,
                        principalSchema: "identity",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_lead_activities_ActivityType",
                schema: "crm",
                table: "lead_activities",
                column: "ActivityType");

            migrationBuilder.CreateIndex(
                name: "IX_lead_activities_CreatedAt",
                schema: "crm",
                table: "lead_activities",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_lead_activities_CreatedByUserId",
                schema: "crm",
                table: "lead_activities",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_lead_activities_LeadId",
                schema: "crm",
                table: "lead_activities",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_lead_activities_NextFollowUpAt",
                schema: "crm",
                table: "lead_activities",
                column: "NextFollowUpAt");

            migrationBuilder.CreateIndex(
                name: "IX_lead_activities_PublicId",
                schema: "crm",
                table: "lead_activities",
                column: "PublicId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_lead_conversions_ChannelSnapshot",
                schema: "crm",
                table: "lead_conversions",
                column: "ChannelSnapshot");

            migrationBuilder.CreateIndex(
                name: "IX_lead_conversions_ConvertedAt",
                schema: "crm",
                table: "lead_conversions",
                column: "ConvertedAt");

            migrationBuilder.CreateIndex(
                name: "IX_lead_conversions_ConvertedByUserId",
                schema: "crm",
                table: "lead_conversions",
                column: "ConvertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_lead_conversions_CourseIdSnapshot",
                schema: "crm",
                table: "lead_conversions",
                column: "CourseIdSnapshot");

            migrationBuilder.CreateIndex(
                name: "IX_lead_conversions_EnrollmentId",
                schema: "crm",
                table: "lead_conversions",
                column: "EnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_lead_conversions_LeadId",
                schema: "crm",
                table: "lead_conversions",
                column: "LeadId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_lead_conversions_PublicId",
                schema: "crm",
                table: "lead_conversions",
                column: "PublicId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_lead_conversions_SourceIdSnapshot",
                schema: "crm",
                table: "lead_conversions",
                column: "SourceIdSnapshot");

            migrationBuilder.CreateIndex(
                name: "IX_lead_conversions_StudentId",
                schema: "crm",
                table: "lead_conversions",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_lead_sources_Channel",
                schema: "crm",
                table: "lead_sources",
                column: "Channel");

            migrationBuilder.CreateIndex(
                name: "IX_lead_sources_Code",
                schema: "crm",
                table: "lead_sources",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_lead_sources_IsActive",
                schema: "crm",
                table: "lead_sources",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_lead_sources_Name",
                schema: "crm",
                table: "lead_sources",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_lead_sources_PublicId",
                schema: "crm",
                table: "lead_sources",
                column: "PublicId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_leads_AssignedToUserId",
                schema: "crm",
                table: "leads",
                column: "AssignedToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_leads_ConvertedAt",
                schema: "crm",
                table: "leads",
                column: "ConvertedAt");

            migrationBuilder.CreateIndex(
                name: "IX_leads_CreatedAt",
                schema: "crm",
                table: "leads",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_leads_Email",
                schema: "crm",
                table: "leads",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_leads_InterestedCourseId",
                schema: "crm",
                table: "leads",
                column: "InterestedCourseId");

            migrationBuilder.CreateIndex(
                name: "IX_leads_LeadCode",
                schema: "crm",
                table: "leads",
                column: "LeadCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_leads_LeadSourceId",
                schema: "crm",
                table: "leads",
                column: "LeadSourceId");

            migrationBuilder.CreateIndex(
                name: "IX_leads_LostReason",
                schema: "crm",
                table: "leads",
                column: "LostReason");

            migrationBuilder.CreateIndex(
                name: "IX_leads_NextFollowUpAt",
                schema: "crm",
                table: "leads",
                column: "NextFollowUpAt");

            migrationBuilder.CreateIndex(
                name: "IX_leads_PhoneNumber",
                schema: "crm",
                table: "leads",
                column: "PhoneNumber");

            migrationBuilder.CreateIndex(
                name: "IX_leads_PublicId",
                schema: "crm",
                table: "leads",
                column: "PublicId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_leads_Status",
                schema: "crm",
                table: "leads",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_leads_UtmCampaign",
                schema: "crm",
                table: "leads",
                column: "UtmCampaign");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "lead_activities",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "lead_conversions",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "leads",
                schema: "crm");

            migrationBuilder.DropTable(
                name: "lead_sources",
                schema: "crm");
        }
    }
}
