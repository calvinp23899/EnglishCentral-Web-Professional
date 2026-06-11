import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

type ApiResult<T> = { isSuccess: boolean; data?: T; error?: string };
export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

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

export type ExamTypePayload = {
  code: string;
  name: string;
  family: string;
  description?: string | null;
  isActive: boolean;
};

export const adminExamTypesApi = {
  async getList(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    family?: string | number;
    isActive?: boolean;
  } = {}) {
    const response = await api.get<ApiResult<PagedResult<AdminExamType>>>(
      ENDPOINTS.ADMIN_EXAM_TYPES.GET_LIST,
      {
        params: {
          Page: params.page ?? 1,
          PageSize: params.pageSize ?? 10,
          Keyword: params.keyword,
          Family: params.family,
          IsActive: params.isActive,
        },
      },
    );

    return unwrap(response.data, "Không thể tải danh sách dạng bài kiểm tra.");
  },

  async getById(id: string | number) {
    const response = await api.get<ApiResult<AdminExamType>>(
      ENDPOINTS.ADMIN_EXAM_TYPES.GET_BY_ID(id),
    );
    return unwrap(response.data, "Không thể tải thông tin dạng bài kiểm tra.");
  },

  async create(payload: ExamTypePayload) {
    const response = await api.post<ApiResult<AdminExamType>>(
      ENDPOINTS.ADMIN_EXAM_TYPES.CREATE,
      payload,
    );
    return unwrap(response.data, "Không thể tạo dạng bài kiểm tra.");
  },

  async update(id: string | number, payload: ExamTypePayload) {
    const response = await api.put<ApiResult<AdminExamType>>(
      ENDPOINTS.ADMIN_EXAM_TYPES.UPDATE(id),
      payload,
    );
    return unwrap(response.data, "Không thể cập nhật dạng bài kiểm tra.");
  },

  async delete(id: string | number) {
    const response = await api.delete<ApiResult<boolean>>(
      ENDPOINTS.ADMIN_EXAM_TYPES.DELETE(id),
    );
    return unwrap(response.data, "Không thể xóa dạng bài kiểm tra.");
  },
};
