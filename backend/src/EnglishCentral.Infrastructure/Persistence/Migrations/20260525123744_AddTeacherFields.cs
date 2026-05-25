using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EnglishCentral.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTeacherFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateOnly>(
                name: "HireDate",
                schema: "academic",
                table: "teachers",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AlterColumn<string>(
                name: "Bio",
                schema: "academic",
                table: "teachers",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                schema: "academic",
                table: "teachers",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankAccountNumber",
                schema: "academic",
                table: "teachers",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankName",
                schema: "academic",
                table: "teachers",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "BaseSalary",
                schema: "academic",
                table: "teachers",
                type: "numeric(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "ContractEndDate",
                schema: "academic",
                table: "teachers",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ContractType",
                schema: "academic",
                table: "teachers",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "DateOfBirth",
                schema: "academic",
                table: "teachers",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Degree",
                schema: "academic",
                table: "teachers",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Gender",
                schema: "academic",
                table: "teachers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "HourlyRate",
                schema: "academic",
                table: "teachers",
                type: "numeric(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NationalId",
                schema: "academic",
                table: "teachers",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "NationalIdIssuedDate",
                schema: "academic",
                table: "teachers",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NationalIdIssuedPlace",
                schema: "academic",
                table: "teachers",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SalaryType",
                schema: "academic",
                table: "teachers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TaxCode",
                schema: "academic",
                table: "teachers",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "YearsOfExperience",
                schema: "academic",
                table: "teachers",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<List<string>>(
                name: "certifications",
                schema: "academic",
                table: "teachers",
                type: "jsonb",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_teachers_NationalId",
                schema: "academic",
                table: "teachers",
                column: "NationalId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_teachers_NationalId",
                schema: "academic",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "Address",
                schema: "academic",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "BankAccountNumber",
                schema: "academic",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "BankName",
                schema: "academic",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "BaseSalary",
                schema: "academic",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "ContractEndDate",
                schema: "academic",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "ContractType",
                schema: "academic",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                schema: "academic",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "Degree",
                schema: "academic",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "Gender",
                schema: "academic",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "HourlyRate",
                schema: "academic",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "NationalId",
                schema: "academic",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "NationalIdIssuedDate",
                schema: "academic",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "NationalIdIssuedPlace",
                schema: "academic",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "SalaryType",
                schema: "academic",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "TaxCode",
                schema: "academic",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "YearsOfExperience",
                schema: "academic",
                table: "teachers");

            migrationBuilder.DropColumn(
                name: "certifications",
                schema: "academic",
                table: "teachers");

            migrationBuilder.AlterColumn<DateOnly>(
                name: "HireDate",
                schema: "academic",
                table: "teachers",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1),
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Bio",
                schema: "academic",
                table: "teachers",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);
        }
    }
}
