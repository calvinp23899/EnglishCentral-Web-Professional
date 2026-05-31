import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

export type AdminTeacher = {
  publicId: string;
  id: number;
  teacherCode: string;
  fullName: string;
  email?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  gender: number;
  address?: string | null;
  nationalId?: string | null;
  nationalIdIssuedDate?: string | null;
  nationalIdIssuedPlace?: string | null;
  specialization?: string | null;
  bio?: string | null;
  degree?: string | null;
  yearsOfExperience?: number | null;
  certifications?: string[] | null;
  hireDate?: string | null;
  contractType?: number | null;
  contractEndDate?: string | null;
  status: number | string;
  salaryType: number;
  baseSalary?: number | null;
  hourlyRate?: number | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  taxCode?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  account?: {
    accountId: number;
    accountEmail: string;
    isActive: boolean;
  } | null;
};

export type TeacherFormPayload = {
  fullName: string;
  email?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  gender: number;
  address?: string | null;
  nationalId?: string | null;
  nationalIdIssuedDate?: string | null;
  nationalIdIssuedPlace?: string | null;
  specialization?: string | null;
  bio?: string | null;
  degree?: string | null;
  yearsOfExperience?: number | null;
  certifications?: string[] | null;
  hireDate: string;
  contractType?: number | null;
  contractEndDate?: string | null;
  status: number;
  salaryType: number;
  baseSalary?: number | null;
  hourlyRate?: number | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  taxCode?: string | null;
};

export type CreateAdminTeacherPayload = TeacherFormPayload & {
  isAccountExists: boolean;
  account: {
    userId?: number | null;
    email?: string | null;
    phoneNumber?: string | null;
    fullName?: string | null;
    role?: string | null;
    password?: string | null;
  };
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

export const adminTeachersApi = {
  async getList(params: {
    page: number;
    pageSize: number;
    keyword?: string;
    sortBy?: string;
    isDescending?: boolean;
    status?: string;
    hireDate?: string;
  }) {
    const response = await api.get<ApiResult<PagedResult<AdminTeacher>>>(
      ENDPOINTS.ADMIN_TEACHERS.GET_LIST,
      {
        params: {
          Page: params.page,
          PageSize: params.pageSize,
          Keyword: params.keyword || undefined,
          SortBy: params.sortBy,
          IsDescending: params.isDescending,
          Status: params.status || undefined,
          HireDate: params.hireDate || undefined,
        },
      }
    );

    return unwrap(response.data, "Không thể tải danh sách giáo viên.");
  },

  async getById(id: string | number) {
    const response = await api.get<ApiResult<AdminTeacher>>(
      ENDPOINTS.ADMIN_TEACHERS.GET_BY_ID(id)
    );

    return unwrap(response.data, "Không thể tải thông tin giáo viên.");
  },

  async create(payload: CreateAdminTeacherPayload) {
    const response = await api.post<ApiResult<AdminTeacher>>(
      ENDPOINTS.ADMIN_TEACHERS.CREATE,
      payload
    );

    return unwrap(response.data, "Không thể tạo giáo viên.");
  },

  async update(id: string | number, payload: TeacherFormPayload) {
    const response = await api.put<ApiResult<AdminTeacher>>(
      ENDPOINTS.ADMIN_TEACHERS.UPDATE(id),
      payload
    );

    return unwrap(response.data, "Không thể cập nhật giáo viên.");
  },

  async delete(id: string | number) {
    const response = await api.delete<ApiResult<boolean>>(
      ENDPOINTS.ADMIN_TEACHERS.DELETE(id)
    );

    return unwrap(response.data, "Không thể xóa giáo viên.");
  },
};
