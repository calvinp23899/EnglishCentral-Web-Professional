import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

import type { PublicPractice } from "../data/mockPractice";

type ApiResult<T> = { data?: T; error?: string; isSuccess: boolean };
type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

type ExamTemplateSummary = {
  code: string;
  description?: string | null;
  durationMinutes?: number | null;
  examType?: {
    code?: string | null;
    family?: string | number | null;
    name?: string | null;
  } | null;
  examTypeCode?: string | null;
  examTypeFamily?: string | number | null;
  examTypeName?: string | null;
  id: number;
  name: string;
  totalScore?: number | null;
};

export type ExamSectionSummary = {
  durationMinutes?: number | null;
  maxScore?: number | null;
  name?: string | null;
  parts?: Array<{
    code: string;
    id?: number;
    instructions?: string | null;
    name: string;
    orderIndex: number;
    publicId?: string;
    questionGroups?: Array<{
      code: string;
      configJson?: string | null;
      id?: number;
      instructions?: string | null;
      publicId?: string;
      questionType: string | number;
      questions?: Array<{
        answerKeys?: Array<{
          correctValue?: string | null;
          examAnswerOptionId?: number | null;
        }>;
        answerOptions?: Array<{
          content: string;
          id?: number;
          label: string;
        }>;
        explanation?: string | null;
        id?: number;
        metadataJson?: string | null;
        orderIndex: number;
        prompt?: string | null;
        publicId?: string;
        title?: string | null;
      }>;
      title?: string | null;
    }>;
    stimuli?: Array<{
      content?: string | null;
      id?: number;
      metadataJson?: string | null;
      publicId?: string;
    }>;
  }>;
  skill?: string | number | null;
};

export type ExamVersionSummary = {
  createdAt?: string | null;
  description?: string | null;
  durationMinutes?: number | null;
  examTemplateId: number;
  id: number;
  name: string;
  publishedAt?: string | null;
  sections?: ExamSectionSummary[];
  status: string | number;
  totalScore?: number | null;
  versionCode: string;
  versionNumber: number;
};

const unwrap = <T>(response: ApiResult<T>) => {
  if (!response.isSuccess || response.data === undefined) {
    throw new Error(response.error ?? "Không thể tải nội dung luyện tập.");
  }

  return response.data;
};

const isPublished = (status: string | number) => {
  const normalized = String(status).toLowerCase();
  return normalized === "published" || normalized === "2";
};

const isIeltsTemplate = (template: ExamTemplateSummary) => {
  const haystack = [
    template.code,
    template.name,
    template.examType?.code,
    template.examType?.name,
    template.examType?.family,
    template.examTypeCode,
    template.examTypeName,
    template.examTypeFamily,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes("ielts");
};

const normalizeSkill = (
  version: ExamVersionSummary,
  template?: ExamTemplateSummary,
): PublicPractice["skill"] => {
  const skill = [
    version.sections?.[0]?.skill,
    version.sections?.[0]?.name,
    version.versionCode,
    version.name,
    template?.code,
    template?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (skill.includes("listening") || skill === "1") return "listening";
  if (skill.includes("writing") || skill === "3") return "writing";
  if (skill.includes("reading") || skill === "2") return "reading";

  return "general";
};

const createSlug = (version: ExamVersionSummary) =>
  `exam-version-${version.id}`;

const mapVersionToPractice = (
  version: ExamVersionSummary,
  template?: ExamTemplateSummary,
): PublicPractice => {
  const duration = version.durationMinutes ?? template?.durationMinutes ?? version.sections?.[0]?.durationMinutes;
  const score = version.totalScore ?? template?.totalScore ?? version.sections?.[0]?.maxScore;

  return {
    category: "ielts",
    description:
      version.description ||
      template?.description ||
      "Bài luyện tập IELTS đã được xuất bản từ ngân hàng bài tập.",
    duration: duration ? `${duration} phút` : "Không giới hạn",
    highlights: [
      `Version ${version.versionNumber}`,
      score ? `Total score ${score}` : "Published test",
      template?.name ?? version.versionCode,
    ].filter(Boolean),
    id: version.id,
    level: "IELTS",
    skill: normalizeSkill(version, template),
    slug: createSlug(version),
    status: "inprogress",
    title: version.name || template?.name || version.versionCode,
  };
};

export const publicPracticeApi = {
  async getPublishedIeltsPractices() {
    const [templatesResult, versionsResult] = await Promise.all([
      api.get<ApiResult<PagedResult<ExamTemplateSummary>>>(ENDPOINTS.ADMIN_EXAM_TEMPLATES.GET_LIST, {
        params: {
          IsActive: true,
          Keyword: "IELTS",
          Page: 1,
          PageSize: 100,
        },
      }),
      api.get<ApiResult<PagedResult<ExamVersionSummary>>>(ENDPOINTS.ADMIN_EXAM_VERSIONS.GET_LIST, {
        params: {
          ExamFamily: "IELTS",
          Page: 1,
          PageSize: 100,
          Status: "Published",
        },
      }),
    ]);

    const templates = unwrap(templatesResult.data).items.filter(isIeltsTemplate);
    const templateById = new Map(templates.map((template) => [template.id, template]));
    const ieltsTemplateIds = new Set(templates.map((template) => template.id));

    return unwrap(versionsResult.data).items
      .filter((version) => isPublished(version.status))
      .filter((version) => !ieltsTemplateIds.size || ieltsTemplateIds.has(version.examTemplateId))
      .map((version) => mapVersionToPractice(version, templateById.get(version.examTemplateId)));
  },

  async getVersionById(id: string | number) {
    const response = await api.get<ApiResult<ExamVersionSummary>>(ENDPOINTS.ADMIN_EXAM_VERSIONS.GET_BY_ID(id));
    return unwrap(response.data);
  },
};
