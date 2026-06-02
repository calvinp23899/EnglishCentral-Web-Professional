import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

export type AdminCourse = {
  publicId: string;
  id: number;
  courseCategoryId: number;
  code: string;
  name: string;
  description?: string | null;
  level?: string | null;
  durationWeeks: number;
  totalSessions: number;
  sessionDurationMinutes: number;
  tuitionFee: number;
  maxStudents: number;
  displayOrder: number;
  isPublished: boolean;
  isActive: boolean;
};

export type CourseFormPayload = Omit<AdminCourse, "publicId" | "id">;

export type UpdateCoursePayload = CourseFormPayload & {
  id: number;
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

export const adminCoursesApi = {
  async getList(params: {
    page: number;
    pageSize: number;
    keyword?: string;
    sortBy?: string;
    isDescending?: boolean;
    courseCategoryId?: number;
    isActive?: boolean;
  }) {
    const response = await api.get<ApiResult<PagedResult<AdminCourse>>>(
      ENDPOINTS.ADMIN_COURSES.GET_LIST,
      {
        params: {
          Page: params.page,
          PageSize: params.pageSize,
          Keyword: params.keyword || undefined,
          SortBy: params.sortBy,
          IsDescending: params.isDescending,
          CourseCategoryId: params.courseCategoryId,
          IsActive: params.isActive,
        },
      },
    );

    return unwrap(response.data, "Không thể tải danh sách khóa học.");
  },

  async getById(id: string | number) {
    const response = await api.get<ApiResult<AdminCourse>>(
      ENDPOINTS.ADMIN_COURSES.GET_BY_ID(id),
    );

    return unwrap(response.data, "Không thể tải thông tin khóa học.");
  },

  async create(payload: CourseFormPayload) {
    const response = await api.post<ApiResult<AdminCourse>>(
      ENDPOINTS.ADMIN_COURSES.CREATE,
      payload,
    );

    return unwrap(response.data, "Không thể tạo khóa học.");
  },

  async update(id: string | number, payload: UpdateCoursePayload) {
    const response = await api.put<ApiResult<AdminCourse>>(
      ENDPOINTS.ADMIN_COURSES.UPDATE(id),
      payload,
    );

    return unwrap(response.data, "Không thể cập nhật khóa học.");
  },

  async delete(id: string | number) {
    const response = await api.delete<ApiResult<boolean>>(
      ENDPOINTS.ADMIN_COURSES.DELETE(id),
    );

    return unwrap(response.data, "Không thể xóa khóa học.");
  },
};
