import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

type ApiResult<T> = { isSuccess: boolean; data?: T; error?: string };
export type PagedResult<T> = { items: T[]; page: number; pageSize: number; totalItems: number; totalPages: number };

const unwrap = <T>(response: ApiResult<T>, message: string) => {
  if (!response.isSuccess || response.data === undefined) {
    throw new Error(response.error ?? message);
  }

  return response.data;
};

export type AdminExamType = {
  publicId: string;
  id: number;
  code: string;
  name: string;
  family: string | number;
  description?: string | null;
  isActive: boolean;
};

export type AdminExamTemplate = {
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

export type ExamTypePayload = {
  code: string;
  name: string;
  family: string;
  description?: string | null;
  isActive: boolean;
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

export const adminExamTemplatesApi = {
  async getTypes(params: { page?: number; pageSize?: number; keyword?: string; family?: string | number; isActive?: boolean } = {}) {
    const response = await api.get<ApiResult<PagedResult<AdminExamType>>>(ENDPOINTS.ADMIN_EXAM_TYPES.GET_LIST, {
      params: {
        Page: params.page ?? 1,
        PageSize: params.pageSize ?? 50,
        Keyword: params.keyword,
        Family: params.family,
        IsActive: params.isActive,
      },
    });

    return unwrap(response.data, "Không thể tải danh sách exam type.");
  },

  async createType(payload: ExamTypePayload) {
    const response = await api.post<ApiResult<AdminExamType>>(ENDPOINTS.ADMIN_EXAM_TYPES.CREATE, payload);
    return unwrap(response.data, "Không thể tạo exam type.");
  },

  async getList(params: { page?: number; pageSize?: number; keyword?: string; examTypeId?: number; status?: string | number; isActive?: boolean; isDescending?: boolean } = {}) {
    const response = await api.get<ApiResult<PagedResult<AdminExamTemplate>>>(ENDPOINTS.ADMIN_EXAM_TEMPLATES.GET_LIST, {
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

    return unwrap(response.data, "Không thể tải danh sách mẫu đề kiểm tra.");
  },

  async getById(id: string | number) {
    const response = await api.get<ApiResult<AdminExamTemplate>>(ENDPOINTS.ADMIN_EXAM_TEMPLATES.GET_BY_ID(id));
    return unwrap(response.data, "Không thể tải thông tin mẫu đề kiểm tra.");
  },

  async create(payload: ExamTemplatePayload) {
    const response = await api.post<ApiResult<AdminExamTemplate>>(ENDPOINTS.ADMIN_EXAM_TEMPLATES.CREATE, payload);
    return unwrap(response.data, "Không thể tạo mẫu đề kiểm tra.");
  },

  async update(id: string | number, payload: ExamTemplatePayload) {
    const response = await api.put<ApiResult<AdminExamTemplate>>(ENDPOINTS.ADMIN_EXAM_TEMPLATES.UPDATE(id), payload);
    return unwrap(response.data, "Không thể cập nhật mẫu đề kiểm tra.");
  },

  async delete(id: string | number) {
    const response = await api.delete<ApiResult<boolean>>(ENDPOINTS.ADMIN_EXAM_TEMPLATES.DELETE(id));
    return unwrap(response.data, "Không thể xóa mẫu đề kiểm tra.");
  },
};
