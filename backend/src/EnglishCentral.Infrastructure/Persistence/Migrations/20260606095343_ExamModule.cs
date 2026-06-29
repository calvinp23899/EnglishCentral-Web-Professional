using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EnglishCentral.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ExamModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "exam");

            migrationBuilder.CreateTable(
                name: "exam_types",
                schema: "exam",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Family = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_exam_types", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "exam_templates",
                schema: "exam",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExamTypeId = table.Column<long>(type: "bigint", nullable: false),
                    CurrentVersionId = table.Column<long>(type: "bigint", nullable: true),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: true),
                    TotalScore = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_exam_templates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_exam_templates_exam_types_ExamTypeId",
                        column: x => x.ExamTypeId,
                        principalSchema: "exam",
                        principalTable: "exam_types",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "exam_versions",
                schema: "exam",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExamTemplateId = table.Column<long>(type: "bigint", nullable: false),
                    VersionCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: true),
                    TotalScore = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    ScoringMode = table.Column<int>(type: "integer", nullable: false),
                    RuntimeConfigJson = table.Column<string>(type: "text", nullable: true),
                    ScoringConfigJson = table.Column<string>(type: "text", nullable: true),
                    PublishedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_exam_versions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_exam_versions_exam_templates_ExamTemplateId",
                        column: x => x.ExamTemplateId,
                        principalSchema: "exam",
                        principalTable: "exam_templates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "exam_attempts",
                schema: "exam",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExamVersionId = table.Column<long>(type: "bigint", nullable: false),
                    StudentId = table.Column<long>(type: "bigint", nullable: true),
                    AttemptCode = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    CandidateName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CandidateEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    StartedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    SubmittedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: true),
                    RawScore = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    ScaledScore = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    BandScore = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    ResultLevel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    RuntimeStateJson = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_exam_attempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_exam_attempts_exam_versions_ExamVersionId",
                        column: x => x.ExamVersionId,
                        principalSchema: "exam",
                        principalTable: "exam_versions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_exam_attempts_students_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "academic",
                        principalTable: "students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "exam_sections",
                schema: "exam",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExamVersionId = table.Column<long>(type: "bigint", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Skill = table.Column<int>(type: "integer", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: true),
                    MaxScore = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Instructions = table.Column<string>(type: "text", nullable: true),
                    RuntimeConfigJson = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_exam_sections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_exam_sections_exam_versions_ExamVersionId",
                        column: x => x.ExamVersionId,
                        principalSchema: "exam",
                        principalTable: "exam_versions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "exam_reviews",
                schema: "exam",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExamAttemptId = table.Column<long>(type: "bigint", nullable: false),
                    ReviewerId = table.Column<long>(type: "bigint", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Score = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Feedback = table.Column<string>(type: "text", nullable: true),
                    RubricJson = table.Column<string>(type: "text", nullable: true),
                    ReviewedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_exam_reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_exam_reviews_exam_attempts_ExamAttemptId",
                        column: x => x.ExamAttemptId,
                        principalSchema: "exam",
                        principalTable: "exam_attempts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "exam_parts",
                schema: "exam",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExamSectionId = table.Column<long>(type: "bigint", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    Instructions = table.Column<string>(type: "text", nullable: true),
                    LayoutConfigJson = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_exam_parts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_exam_parts_exam_sections_ExamSectionId",
                        column: x => x.ExamSectionId,
                        principalSchema: "exam",
                        principalTable: "exam_sections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "exam_scoring_rules",
                schema: "exam",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExamVersionId = table.Column<long>(type: "bigint", nullable: false),
                    ExamSectionId = table.Column<long>(type: "bigint", nullable: true),
                    Skill = table.Column<int>(type: "integer", nullable: true),
                    QuestionType = table.Column<int>(type: "integer", nullable: true),
                    RuleCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    MaxScore = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    ConfigJson = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_exam_scoring_rules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_exam_scoring_rules_exam_sections_ExamSectionId",
                        column: x => x.ExamSectionId,
                        principalSchema: "exam",
                        principalTable: "exam_sections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_exam_scoring_rules_exam_versions_ExamVersionId",
                        column: x => x.ExamVersionId,
                        principalSchema: "exam",
                        principalTable: "exam_versions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "exam_section_attempts",
                schema: "exam",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExamAttemptId = table.Column<long>(type: "bigint", nullable: false),
                    ExamSectionId = table.Column<long>(type: "bigint", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    StartedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    SubmittedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: true),
                    RawScore = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    ScaledScore = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    BandScore = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
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
                    table.PrimaryKey("PK_exam_section_attempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_exam_section_attempts_exam_attempts_ExamAttemptId",
                        column: x => x.ExamAttemptId,
                        principalSchema: "exam",
                        principalTable: "exam_attempts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_exam_section_attempts_exam_sections_ExamSectionId",
                        column: x => x.ExamSectionId,
                        principalSchema: "exam",
                        principalTable: "exam_sections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "exam_stimuli",
                schema: "exam",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExamPartId = table.Column<long>(type: "bigint", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Content = table.Column<string>(type: "text", nullable: true),
                    AssetUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Transcript = table.Column<string>(type: "text", nullable: true),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_exam_stimuli", x => x.Id);
                    table.ForeignKey(
                        name: "FK_exam_stimuli_exam_parts_ExamPartId",
                        column: x => x.ExamPartId,
                        principalSchema: "exam",
                        principalTable: "exam_parts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "exam_question_groups",
                schema: "exam",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExamPartId = table.Column<long>(type: "bigint", nullable: false),
                    ExamStimulusId = table.Column<long>(type: "bigint", nullable: true),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Instructions = table.Column<string>(type: "text", nullable: true),
                    QuestionType = table.Column<int>(type: "integer", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    ConfigJson = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_exam_question_groups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_exam_question_groups_exam_parts_ExamPartId",
                        column: x => x.ExamPartId,
                        principalSchema: "exam",
                        principalTable: "exam_parts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_exam_question_groups_exam_stimuli_ExamStimulusId",
                        column: x => x.ExamStimulusId,
                        principalSchema: "exam",
                        principalTable: "exam_stimuli",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "exam_questions",
                schema: "exam",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExamQuestionGroupId = table.Column<long>(type: "bigint", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Prompt = table.Column<string>(type: "text", nullable: true),
                    QuestionType = table.Column<int>(type: "integer", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    Points = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    Explanation = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("PK_exam_questions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_exam_questions_exam_question_groups_ExamQuestionGroupId",
                        column: x => x.ExamQuestionGroupId,
                        principalSchema: "exam",
                        principalTable: "exam_question_groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "exam_answer_options",
                schema: "exam",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExamQuestionId = table.Column<long>(type: "bigint", nullable: false),
                    Label = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_exam_answer_options", x => x.Id);
                    table.ForeignKey(
                        name: "FK_exam_answer_options_exam_questions_ExamQuestionId",
                        column: x => x.ExamQuestionId,
                        principalSchema: "exam",
                        principalTable: "exam_questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "exam_answer_keys",
                schema: "exam",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExamQuestionId = table.Column<long>(type: "bigint", nullable: false),
                    ExamAnswerOptionId = table.Column<long>(type: "bigint", nullable: true),
                    CorrectValue = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    MatchPattern = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Score = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CaseSensitive = table.Column<bool>(type: "boolean", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_exam_answer_keys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_exam_answer_keys_exam_answer_options_ExamAnswerOptionId",
                        column: x => x.ExamAnswerOptionId,
                        principalSchema: "exam",
                        principalTable: "exam_answer_options",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_exam_answer_keys_exam_questions_ExamQuestionId",
                        column: x => x.ExamQuestionId,
                        principalSchema: "exam",
                        principalTable: "exam_questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "exam_question_responses",
                schema: "exam",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExamAttemptId = table.Column<long>(type: "bigint", nullable: false),
                    ExamSectionAttemptId = table.Column<long>(type: "bigint", nullable: true),
                    ExamQuestionId = table.Column<long>(type: "bigint", nullable: false),
                    ExamAnswerOptionId = table.Column<long>(type: "bigint", nullable: true),
                    AnswerText = table.Column<string>(type: "text", nullable: true),
                    AnswerJson = table.Column<string>(type: "text", nullable: true),
                    Score = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    IsCorrect = table.Column<bool>(type: "boolean", nullable: true),
                    ReviewStatus = table.Column<int>(type: "integer", nullable: false),
                    Feedback = table.Column<string>(type: "text", nullable: true),
                    AnsweredAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_exam_question_responses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_exam_question_responses_exam_answer_options_ExamAnswerOptionId",
                        column: x => x.ExamAnswerOptionId,
                        principalSchema: "exam",
                        principalTable: "exam_answer_options",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_exam_question_responses_exam_attempts_ExamAttemptId",
                        column: x => x.ExamAttemptId,
                        principalSchema: "exam",
                        principalTable: "exam_attempts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_exam_question_responses_exam_questions_ExamQuestionId",
                        column: x => x.ExamQuestionId,
                        principalSchema: "exam",
                        principalTable: "exam_questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_exam_question_responses_exam_section_attempts_ExamSectionAttemptId",
                        column: x => x.ExamSectionAttemptId,
                        principalSchema: "exam",
                        principalTable: "exam_section_attempts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateExamIndexes();

            migrationBuilder.AddForeignKey(
                name: "FK_exam_templates_exam_versions_CurrentVersionId",
                schema: "exam",
                table: "exam_templates",
                column: "CurrentVersionId",
                principalSchema: "exam",
                principalTable: "exam_versions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_exam_templates_exam_versions_CurrentVersionId",
                schema: "exam",
                table: "exam_templates");

            migrationBuilder.DropTable(name: "exam_answer_keys", schema: "exam");
            migrationBuilder.DropTable(name: "exam_question_responses", schema: "exam");
            migrationBuilder.DropTable(name: "exam_reviews", schema: "exam");
            migrationBuilder.DropTable(name: "exam_scoring_rules", schema: "exam");
            migrationBuilder.DropTable(name: "exam_answer_options", schema: "exam");
            migrationBuilder.DropTable(name: "exam_section_attempts", schema: "exam");
            migrationBuilder.DropTable(name: "exam_questions", schema: "exam");
            migrationBuilder.DropTable(name: "exam_attempts", schema: "exam");
            migrationBuilder.DropTable(name: "exam_question_groups", schema: "exam");
            migrationBuilder.DropTable(name: "exam_stimuli", schema: "exam");
            migrationBuilder.DropTable(name: "exam_parts", schema: "exam");
            migrationBuilder.DropTable(name: "exam_sections", schema: "exam");
            migrationBuilder.DropTable(name: "exam_versions", schema: "exam");
            migrationBuilder.DropTable(name: "exam_templates", schema: "exam");
            migrationBuilder.DropTable(name: "exam_types", schema: "exam");
        }
    }

    internal static class ExamModuleMigrationIndexes
    {
        public static void CreateExamIndexes(this MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(name: "IX_exam_answer_keys_ExamAnswerOptionId", schema: "exam", table: "exam_answer_keys", column: "ExamAnswerOptionId");
            migrationBuilder.CreateIndex(name: "IX_exam_answer_keys_ExamQuestionId_OrderIndex", schema: "exam", table: "exam_answer_keys", columns: new[] { "ExamQuestionId", "OrderIndex" });
            migrationBuilder.CreateIndex(name: "IX_exam_answer_keys_PublicId", schema: "exam", table: "exam_answer_keys", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_answer_options_ExamQuestionId_Label", schema: "exam", table: "exam_answer_options", columns: new[] { "ExamQuestionId", "Label" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_answer_options_ExamQuestionId_OrderIndex", schema: "exam", table: "exam_answer_options", columns: new[] { "ExamQuestionId", "OrderIndex" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_answer_options_PublicId", schema: "exam", table: "exam_answer_options", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_attempts_AttemptCode", schema: "exam", table: "exam_attempts", column: "AttemptCode", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_attempts_ExamVersionId", schema: "exam", table: "exam_attempts", column: "ExamVersionId");
            migrationBuilder.CreateIndex(name: "IX_exam_attempts_PublicId", schema: "exam", table: "exam_attempts", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_attempts_StartedAt", schema: "exam", table: "exam_attempts", column: "StartedAt");
            migrationBuilder.CreateIndex(name: "IX_exam_attempts_Status", schema: "exam", table: "exam_attempts", column: "Status");
            migrationBuilder.CreateIndex(name: "IX_exam_attempts_StudentId", schema: "exam", table: "exam_attempts", column: "StudentId");
            migrationBuilder.CreateIndex(name: "IX_exam_attempts_SubmittedAt", schema: "exam", table: "exam_attempts", column: "SubmittedAt");
            migrationBuilder.CreateIndex(name: "IX_exam_parts_ExamSectionId_Code", schema: "exam", table: "exam_parts", columns: new[] { "ExamSectionId", "Code" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_parts_ExamSectionId_OrderIndex", schema: "exam", table: "exam_parts", columns: new[] { "ExamSectionId", "OrderIndex" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_parts_PublicId", schema: "exam", table: "exam_parts", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_question_groups_ExamPartId_Code", schema: "exam", table: "exam_question_groups", columns: new[] { "ExamPartId", "Code" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_question_groups_ExamPartId_OrderIndex", schema: "exam", table: "exam_question_groups", columns: new[] { "ExamPartId", "OrderIndex" });
            migrationBuilder.CreateIndex(name: "IX_exam_question_groups_ExamStimulusId", schema: "exam", table: "exam_question_groups", column: "ExamStimulusId");
            migrationBuilder.CreateIndex(name: "IX_exam_question_groups_PublicId", schema: "exam", table: "exam_question_groups", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_question_groups_QuestionType", schema: "exam", table: "exam_question_groups", column: "QuestionType");
            migrationBuilder.CreateIndex(name: "IX_exam_question_responses_ExamAnswerOptionId", schema: "exam", table: "exam_question_responses", column: "ExamAnswerOptionId");
            migrationBuilder.CreateIndex(name: "IX_exam_question_responses_ExamAttemptId_ExamQuestionId", schema: "exam", table: "exam_question_responses", columns: new[] { "ExamAttemptId", "ExamQuestionId" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_question_responses_ExamQuestionId", schema: "exam", table: "exam_question_responses", column: "ExamQuestionId");
            migrationBuilder.CreateIndex(name: "IX_exam_question_responses_ExamSectionAttemptId", schema: "exam", table: "exam_question_responses", column: "ExamSectionAttemptId");
            migrationBuilder.CreateIndex(name: "IX_exam_question_responses_PublicId", schema: "exam", table: "exam_question_responses", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_question_responses_ReviewStatus", schema: "exam", table: "exam_question_responses", column: "ReviewStatus");
            migrationBuilder.CreateIndex(name: "IX_exam_questions_ExamQuestionGroupId_Code", schema: "exam", table: "exam_questions", columns: new[] { "ExamQuestionGroupId", "Code" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_questions_ExamQuestionGroupId_OrderIndex", schema: "exam", table: "exam_questions", columns: new[] { "ExamQuestionGroupId", "OrderIndex" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_questions_PublicId", schema: "exam", table: "exam_questions", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_questions_QuestionType", schema: "exam", table: "exam_questions", column: "QuestionType");
            migrationBuilder.CreateIndex(name: "IX_exam_reviews_ExamAttemptId", schema: "exam", table: "exam_reviews", column: "ExamAttemptId");
            migrationBuilder.CreateIndex(name: "IX_exam_reviews_PublicId", schema: "exam", table: "exam_reviews", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_reviews_ReviewedAt", schema: "exam", table: "exam_reviews", column: "ReviewedAt");
            migrationBuilder.CreateIndex(name: "IX_exam_reviews_ReviewerId", schema: "exam", table: "exam_reviews", column: "ReviewerId");
            migrationBuilder.CreateIndex(name: "IX_exam_reviews_Status", schema: "exam", table: "exam_reviews", column: "Status");
            migrationBuilder.CreateIndex(name: "IX_exam_scoring_rules_ExamSectionId", schema: "exam", table: "exam_scoring_rules", column: "ExamSectionId");
            migrationBuilder.CreateIndex(name: "IX_exam_scoring_rules_ExamVersionId_RuleCode", schema: "exam", table: "exam_scoring_rules", columns: new[] { "ExamVersionId", "RuleCode" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_scoring_rules_PublicId", schema: "exam", table: "exam_scoring_rules", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_scoring_rules_QuestionType", schema: "exam", table: "exam_scoring_rules", column: "QuestionType");
            migrationBuilder.CreateIndex(name: "IX_exam_scoring_rules_Skill", schema: "exam", table: "exam_scoring_rules", column: "Skill");
            migrationBuilder.CreateIndex(name: "IX_exam_section_attempts_ExamAttemptId_ExamSectionId", schema: "exam", table: "exam_section_attempts", columns: new[] { "ExamAttemptId", "ExamSectionId" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_section_attempts_ExamSectionId", schema: "exam", table: "exam_section_attempts", column: "ExamSectionId");
            migrationBuilder.CreateIndex(name: "IX_exam_section_attempts_PublicId", schema: "exam", table: "exam_section_attempts", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_section_attempts_Status", schema: "exam", table: "exam_section_attempts", column: "Status");
            migrationBuilder.CreateIndex(name: "IX_exam_sections_ExamVersionId_Code", schema: "exam", table: "exam_sections", columns: new[] { "ExamVersionId", "Code" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_sections_ExamVersionId_OrderIndex", schema: "exam", table: "exam_sections", columns: new[] { "ExamVersionId", "OrderIndex" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_sections_PublicId", schema: "exam", table: "exam_sections", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_sections_Skill", schema: "exam", table: "exam_sections", column: "Skill");
            migrationBuilder.CreateIndex(name: "IX_exam_stimuli_ExamPartId_OrderIndex", schema: "exam", table: "exam_stimuli", columns: new[] { "ExamPartId", "OrderIndex" });
            migrationBuilder.CreateIndex(name: "IX_exam_stimuli_PublicId", schema: "exam", table: "exam_stimuli", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_stimuli_Type", schema: "exam", table: "exam_stimuli", column: "Type");
            migrationBuilder.CreateIndex(name: "IX_exam_templates_Code", schema: "exam", table: "exam_templates", column: "Code", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_templates_CurrentVersionId", schema: "exam", table: "exam_templates", column: "CurrentVersionId");
            migrationBuilder.CreateIndex(name: "IX_exam_templates_ExamTypeId", schema: "exam", table: "exam_templates", column: "ExamTypeId");
            migrationBuilder.CreateIndex(name: "IX_exam_templates_IsActive", schema: "exam", table: "exam_templates", column: "IsActive");
            migrationBuilder.CreateIndex(name: "IX_exam_templates_PublicId", schema: "exam", table: "exam_templates", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_templates_Status", schema: "exam", table: "exam_templates", column: "Status");
            migrationBuilder.CreateIndex(name: "IX_exam_types_Code", schema: "exam", table: "exam_types", column: "Code", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_types_Family", schema: "exam", table: "exam_types", column: "Family");
            migrationBuilder.CreateIndex(name: "IX_exam_types_IsActive", schema: "exam", table: "exam_types", column: "IsActive");
            migrationBuilder.CreateIndex(name: "IX_exam_types_PublicId", schema: "exam", table: "exam_types", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_versions_ExamTemplateId_VersionCode", schema: "exam", table: "exam_versions", columns: new[] { "ExamTemplateId", "VersionCode" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_versions_ExamTemplateId_VersionNumber", schema: "exam", table: "exam_versions", columns: new[] { "ExamTemplateId", "VersionNumber" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_versions_PublicId", schema: "exam", table: "exam_versions", column: "PublicId", unique: true);
            migrationBuilder.CreateIndex(name: "IX_exam_versions_PublishedAt", schema: "exam", table: "exam_versions", column: "PublishedAt");
            migrationBuilder.CreateIndex(name: "IX_exam_versions_Status", schema: "exam", table: "exam_versions", column: "Status");
        }
    }
}
