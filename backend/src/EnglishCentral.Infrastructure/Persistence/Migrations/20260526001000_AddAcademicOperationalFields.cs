using System;
using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishCentral.Infrastructure.Persistence.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260526001000_AddAcademicOperationalFields")]
    public partial class AddAcademicOperationalFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                schema: "academic",
                table: "courses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SessionDurationMinutes",
                schema: "academic",
                table: "courses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalSessions",
                schema: "academic",
                table: "courses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ClosedAt",
                schema: "academic",
                table: "classes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompletedSessions",
                schema: "academic",
                table: "classes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "OpenedAt",
                schema: "academic",
                table: "classes",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RoomId",
                schema: "academic",
                table: "classes",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TuitionFeeSnapshot",
                schema: "academic",
                table: "classes",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "TotalSessions",
                schema: "academic",
                table: "classes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CancellationReason",
                schema: "academic",
                table: "enrollments",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CancelledAt",
                schema: "academic",
                table: "enrollments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "CancelledBy",
                schema: "academic",
                table: "enrollments",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "EndDate",
                schema: "academic",
                table: "enrollments",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EnrollmentCode",
                schema: "academic",
                table: "enrollments",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "OutstandingAmount",
                schema: "academic",
                table: "enrollments",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PaidAmount",
                schema: "academic",
                table: "enrollments",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateOnly>(
                name: "StartDate",
                schema: "academic",
                table: "enrollments",
                type: "date",
                nullable: true);

            migrationBuilder.Sql(
                "UPDATE academic.enrollments SET \"EnrollmentCode\" = CONCAT('ENR-', \"Id\") WHERE \"EnrollmentCode\" IS NULL;");

            migrationBuilder.AlterColumn<string>(
                name: "EnrollmentCode",
                schema: "academic",
                table: "enrollments",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CancellationReason",
                schema: "academic",
                table: "class_sessions",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "EndedAt",
                schema: "academic",
                table: "class_sessions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPayrollLocked",
                schema: "academic",
                table: "class_sessions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "StartedAt",
                schema: "academic",
                table: "class_sessions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "SubstituteTeacherId",
                schema: "academic",
                table: "class_sessions",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AbsenceReason",
                schema: "academic",
                table: "attendances",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "RecordedAt",
                schema: "academic",
                table: "attendances",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RecordedBy",
                schema: "academic",
                table: "attendances",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_courses_DisplayOrder",
                schema: "academic",
                table: "courses",
                column: "DisplayOrder");

            migrationBuilder.CreateIndex(
                name: "IX_classes_RoomId",
                schema: "academic",
                table: "classes",
                column: "RoomId");

            migrationBuilder.CreateIndex(
                name: "IX_enrollments_EnrollmentCode",
                schema: "academic",
                table: "enrollments",
                column: "EnrollmentCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_class_sessions_SubstituteTeacherId",
                schema: "academic",
                table: "class_sessions",
                column: "SubstituteTeacherId");

            migrationBuilder.AddForeignKey(
                name: "FK_classes_rooms_RoomId",
                schema: "academic",
                table: "classes",
                column: "RoomId",
                principalSchema: "academic",
                principalTable: "rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_class_sessions_teachers_SubstituteTeacherId",
                schema: "academic",
                table: "class_sessions",
                column: "SubstituteTeacherId",
                principalSchema: "academic",
                principalTable: "teachers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_classes_rooms_RoomId",
                schema: "academic",
                table: "classes");

            migrationBuilder.DropForeignKey(
                name: "FK_class_sessions_teachers_SubstituteTeacherId",
                schema: "academic",
                table: "class_sessions");

            migrationBuilder.DropIndex(
                name: "IX_courses_DisplayOrder",
                schema: "academic",
                table: "courses");

            migrationBuilder.DropIndex(
                name: "IX_classes_RoomId",
                schema: "academic",
                table: "classes");

            migrationBuilder.DropIndex(
                name: "IX_enrollments_EnrollmentCode",
                schema: "academic",
                table: "enrollments");

            migrationBuilder.DropIndex(
                name: "IX_class_sessions_SubstituteTeacherId",
                schema: "academic",
                table: "class_sessions");

            migrationBuilder.DropColumn(name: "DisplayOrder", schema: "academic", table: "courses");
            migrationBuilder.DropColumn(name: "SessionDurationMinutes", schema: "academic", table: "courses");
            migrationBuilder.DropColumn(name: "TotalSessions", schema: "academic", table: "courses");
            migrationBuilder.DropColumn(name: "ClosedAt", schema: "academic", table: "classes");
            migrationBuilder.DropColumn(name: "CompletedSessions", schema: "academic", table: "classes");
            migrationBuilder.DropColumn(name: "OpenedAt", schema: "academic", table: "classes");
            migrationBuilder.DropColumn(name: "RoomId", schema: "academic", table: "classes");
            migrationBuilder.DropColumn(name: "TuitionFeeSnapshot", schema: "academic", table: "classes");
            migrationBuilder.DropColumn(name: "TotalSessions", schema: "academic", table: "classes");
            migrationBuilder.DropColumn(name: "CancellationReason", schema: "academic", table: "enrollments");
            migrationBuilder.DropColumn(name: "CancelledAt", schema: "academic", table: "enrollments");
            migrationBuilder.DropColumn(name: "CancelledBy", schema: "academic", table: "enrollments");
            migrationBuilder.DropColumn(name: "EndDate", schema: "academic", table: "enrollments");
            migrationBuilder.DropColumn(name: "EnrollmentCode", schema: "academic", table: "enrollments");
            migrationBuilder.DropColumn(name: "OutstandingAmount", schema: "academic", table: "enrollments");
            migrationBuilder.DropColumn(name: "PaidAmount", schema: "academic", table: "enrollments");
            migrationBuilder.DropColumn(name: "StartDate", schema: "academic", table: "enrollments");
            migrationBuilder.DropColumn(name: "CancellationReason", schema: "academic", table: "class_sessions");
            migrationBuilder.DropColumn(name: "EndedAt", schema: "academic", table: "class_sessions");
            migrationBuilder.DropColumn(name: "IsPayrollLocked", schema: "academic", table: "class_sessions");
            migrationBuilder.DropColumn(name: "StartedAt", schema: "academic", table: "class_sessions");
            migrationBuilder.DropColumn(name: "SubstituteTeacherId", schema: "academic", table: "class_sessions");
            migrationBuilder.DropColumn(name: "AbsenceReason", schema: "academic", table: "attendances");
            migrationBuilder.DropColumn(name: "RecordedAt", schema: "academic", table: "attendances");
            migrationBuilder.DropColumn(name: "RecordedBy", schema: "academic", table: "attendances");
        }
    }
}
