import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

type ApiResult<T> = { isSuccess: boolean; data?: T; error?: string };
type PagedResult<T> = { items: T[]; page: number; pageSize: number; totalItems: number; totalPages: number };

const unwrap = <T>(response: ApiResult<T>, message: string) => {
  if (!response.isSuccess || response.data === undefined) {
    throw new Error(response.error ?? message);
  }

  return response.data;
};

export type ExamType = {
  publicId: string;
  id: number;
  code: string;
  name: string;
  family: string | number;
  description?: string | null;
  isActive: boolean;
};

export type ExamTemplate = {
  publicId: string;
  id: number;
  examTypeId: number;
  currentVersionId?: number | null;
  code: string;
  name: string;
  description?: string | null;
  durationMinutes?: number | null;
  totalScore?: number | null;
  status: string | number;
  isActive: boolean;
};

export type ExamAnswerOption = {
  publicId?: string;
  id?: number;
  label: string;
  content: string;
  orderIndex: number;
  metadataJson?: string | null;
};

export type ExamAnswerKey = {
  publicId?: string;
  id?: number;
  examAnswerOptionId?: number | null;
  correctValue?: string | null;
  matchPattern?: string | null;
  score: number;
  caseSensitive: boolean;
  orderIndex: number;
};

export type ExamQuestion = {
  publicId?: string;
  id?: number;
  code: string;
  prompt?: string | null;
  questionType: string | number;
  orderIndex: number;
  points: number;
  isRequired: boolean;
  explanation?: string | null;
  metadataJson?: string | null;
  answerOptions: ExamAnswerOption[];
  answerKeys: ExamAnswerKey[];
};

export type ExamQuestionGroup = {
  publicId?: string;
  id?: number;
  examStimulusId?: number | null;
  code: string;
  title?: string | null;
  instructions?: string | null;
  questionType: string | number;
  orderIndex: number;
  configJson?: string | null;
  questions: ExamQuestion[];
};

export type ExamStimulus = {
  publicId?: string;
  id?: number;
  type: string | number;
  title?: string | null;
  content?: string | null;
  assetUrl?: string | null;
  transcript?: string | null;
  orderIndex: number;
  metadataJson?: string | null;
};

export type ExamPart = {
  publicId?: string;
  id?: number;
  code: string;
  name: string;
  orderIndex: number;
  instructions?: string | null;
  layoutConfigJson?: string | null;
  stimuli: ExamStimulus[];
  questionGroups: ExamQuestionGroup[];
};

export type ExamSection = {
  publicId?: string;
  id?: number;
  code: string;
  name: string;
  skill: string | number;
  orderIndex: number;
  durationMinutes?: number | null;
  maxScore?: number | null;
  instructions?: string | null;
  runtimeConfigJson?: string | null;
  parts: ExamPart[];
};

export type ExamVersion = {
  publicId: string;
  id: number;
  examTemplateId: number;
  versionCode: string;
  versionNumber: number;
  name: string;
  description?: string | null;
  status: string | number;
  durationMinutes?: number | null;
  totalScore?: number | null;
  scoringMode: string | number;
  runtimeConfigJson?: string | null;
  scoringConfigJson?: string | null;
  publishedAt?: string | null;
  sections: ExamSection[];
  scoringRules: unknown[];
};

export type ExamTemplatePayload = {
  examTypeId: number;
  code: string;
  name: string;
  description?: string | null;
  durationMinutes?: number | null;
  totalScore?: number | null;
  isActive: boolean;
};

export type ExamVersionPayload = {
  examTemplateId: number;
  versionCode: string;
  versionNumber: number;
  name: string;
  description?: string | null;
  durationMinutes?: number | null;
  totalScore?: number | null;
  scoringMode: "Auto" | "Manual" | "Hybrid";
  runtimeConfigJson?: string | null;
  scoringConfigJson?: string | null;
  sections: Array<{
    code: string;
    name: string;
    skill: "Reading";
    orderIndex: number;
    durationMinutes?: number | null;
    maxScore?: number | null;
    instructions?: string | null;
    runtimeConfigJson?: string | null;
    parts: Array<{
      code: string;
      name: string;
      orderIndex: number;
      instructions?: string | null;
      layoutConfigJson?: string | null;
      stimuli?: Array<{
        clientKey: string;
        type: "Text";
        title?: string | null;
        content?: string | null;
        assetUrl?: string | null;
        transcript?: string | null;
        orderIndex: number;
        metadataJson?: string | null;
      }> | null;
      questionGroups: Array<{
        code: string;
        stimulusClientKey?: string | null;
        title?: string | null;
        instructions?: string | null;
        questionType: string;
        orderIndex: number;
        configJson?: string | null;
        questions: Array<{
          code: string;
          prompt?: string | null;
          questionType: string;
          orderIndex: number;
          points: number;
          isRequired: boolean;
          explanation?: string | null;
          metadataJson?: string | null;
          answerOptions?: Array<{
            clientKey: string;
            label: string;
            content: string;
            orderIndex: number;
            metadataJson?: string | null;
          }> | null;
          answerKeys?: Array<{
            answerOptionClientKey?: string | null;
            correctValue?: string | null;
            matchPattern?: string | null;
            score: number;
            caseSensitive: boolean;
            orderIndex: number;
          }> | null;
        }>;
      }>;
    }>;
  }>;
  scoringRules?: unknown[] | null;
};

export const adminIeltsReadingApi = {
  async getExamTypes(params: { page?: number; pageSize?: number; keyword?: string; family?: string | number; isActive?: boolean } = {}) {
    const response = await api.get<ApiResult<PagedResult<ExamType>>>(ENDPOINTS.ADMIN_EXAM_TYPES.GET_LIST, {
      params: {
        Page: params.page ?? 1,
        PageSize: params.pageSize ?? 50,
        Keyword: params.keyword,
        Family: params.family,
        IsActive: params.isActive,
      },
    });
    return unwrap(response.data, "Không thể tải danh sách loại đề thi.");
  },

  async getReadingExamType() {
    const result = await this.getExamTypes({ family: "IELTS", isActive: true, pageSize: 50 });
    return result.items.find((item) => `${item.code} ${item.name}`.toLowerCase().includes("reading")) ?? result.items[0] ?? null;
  },

  async getTemplates(params: { page?: number; pageSize?: number; keyword?: string; examTypeId?: number; status?: string | number; isActive?: boolean; isDescending?: boolean } = {}) {
    const response = await api.get<ApiResult<PagedResult<ExamTemplate>>>(ENDPOINTS.ADMIN_EXAM_TEMPLATES.GET_LIST, {
      params: {
        Page: params.page ?? 1,
        PageSize: params.pageSize ?? 10,
        Keyword: params.keyword,
        ExamTypeId: params.examTypeId,
        Status: params.status,
        IsActive: params.isActive,
        IsDescending: params.isDescending ?? true,
      },
    });
    return unwrap(response.data, "Không thể tải danh sách IELTS Reading.");
  },

  async getTemplateById(id: string | number) {
    const response = await api.get<ApiResult<ExamTemplate>>(ENDPOINTS.ADMIN_EXAM_TEMPLATES.GET_BY_ID(id));
    return unwrap(response.data, "Không thể tải thông tin đề IELTS Reading.");
  },

  async createTemplate(payload: ExamTemplatePayload) {
    const response = await api.post<ApiResult<ExamTemplate>>(ENDPOINTS.ADMIN_EXAM_TEMPLATES.CREATE, payload);
    return unwrap(response.data, "Không thể tạo đề IELTS Reading.");
  },

  async updateTemplate(id: string | number, payload: ExamTemplatePayload) {
    const response = await api.put<ApiResult<ExamTemplate>>(ENDPOINTS.ADMIN_EXAM_TEMPLATES.UPDATE(id), payload);
    return unwrap(response.data, "Không thể cập nhật đề IELTS Reading.");
  },

  async deleteTemplate(id: string | number) {
    const response = await api.delete<ApiResult<boolean>>(ENDPOINTS.ADMIN_EXAM_TEMPLATES.DELETE(id));
    return unwrap(response.data, "Không thể xóa đề IELTS Reading.");
  },

  async getVersions(params: { page?: number; pageSize?: number; examTemplateId?: number; status?: string | number; keyword?: string } = {}) {
    const response = await api.get<ApiResult<PagedResult<ExamVersion>>>(ENDPOINTS.ADMIN_EXAM_VERSIONS.GET_LIST, {
      params: {
        Page: params.page ?? 1,
        PageSize: params.pageSize ?? 20,
        ExamTemplateId: params.examTemplateId,
        Status: params.status,
        Keyword: params.keyword,
      },
    });
    return unwrap(response.data, "Không thể tải phiên bản đề IELTS Reading.");
  },

  async getVersionById(id: string | number) {
    const response = await api.get<ApiResult<ExamVersion>>(ENDPOINTS.ADMIN_EXAM_VERSIONS.GET_BY_ID(id));
    return unwrap(response.data, "Không thể tải nội dung đề IELTS Reading.");
  },

  async createVersion(payload: ExamVersionPayload) {
    const response = await api.post<ApiResult<ExamVersion>>(ENDPOINTS.ADMIN_EXAM_VERSIONS.CREATE, payload);
    return unwrap(response.data, "Không thể lưu nội dung đề IELTS Reading.");
  },

  async publishVersion(id: string | number) {
    const response = await api.post<ApiResult<ExamVersion>>(ENDPOINTS.ADMIN_EXAM_VERSIONS.PUBLISH(id));
    return unwrap(response.data, "Không thể publish đề IELTS Reading.");
  },
};
