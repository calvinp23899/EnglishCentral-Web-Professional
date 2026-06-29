import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

export type AdminCourseCategory = {
  publicId: string;
  id: number;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
};

export type CourseCategoryFormPayload = {
  name: string;
  description?: string | null;
  isActive: boolean;
};

export type UpdateCourseCategoryPayload = CourseCategoryFormPayload & {
  id: number;
  code: string;
};

type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

type ApiResult<T> = {
  isSuccess: boolean;
  data?: T;
  error?: string;
};

const unwrap = <T>(response: ApiResult<T>, fallbackMessage: string) => {
  if (!response.isSuccess || response.data === undefined) {
    throw new Error(response.error ?? fallbackMessage);
  }

  return response.data;
};

export const adminCourseCategoriesApi = {
  async getList(params: {
    page: number;
    pageSize: number;
    keyword?: string;
    sortBy?: string;
    isDescending?: boolean;
    isActive?: boolean;
  }) {
    const response = await api.get<ApiResult<PagedResult<AdminCourseCategory>>>(
      ENDPOINTS.ADMIN_COURSE_CATEGORIES.GET_LIST,
      {
        params: {
          Page: params.page,
          PageSize: params.pageSize,
          Keyword: params.keyword || undefined,
          SortBy: params.sortBy,
          IsDescending: params.isDescending,
          IsActive: params.isActive,
        },
      },
    );

    return unwrap(response.data, "Không thể tải danh sách danh mục khóa học.");
  },

  async getById(id: string | number) {
    const response = await api.get<ApiResult<AdminCourseCategory>>(
      ENDPOINTS.ADMIN_COURSE_CATEGORIES.GET_BY_ID(id),
    );

    return unwrap(response.data, "Không thể tải thông tin danh mục khóa học.");
  },

  async create(payload: CourseCategoryFormPayload) {
    const response = await api.post<ApiResult<AdminCourseCategory>>(
      ENDPOINTS.ADMIN_COURSE_CATEGORIES.CREATE,
      payload,
    );

    return unwrap(response.data, "Không thể tạo danh mục khóa học.");
  },

  async update(id: string | number, payload: UpdateCourseCategoryPayload) {
    const response = await api.put<ApiResult<AdminCourseCategory>>(
      ENDPOINTS.ADMIN_COURSE_CATEGORIES.UPDATE(id),
      payload,
    );

    return unwrap(response.data, "Không thể cập nhật danh mục khóa học.");
  },

  async delete(id: string | number) {
    const response = await api.delete<ApiResult<boolean>>(
      ENDPOINTS.ADMIN_COURSE_CATEGORIES.DELETE(id),
    );

    return unwrap(response.data, "Không thể xóa danh mục khóa học.");
  },
};
