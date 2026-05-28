import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

export type StudentStatus = 1 | 2;

export type AdminStudent = {
  publicId: string;
  id?: string;
  studentCode: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string | number;
  email?: string;
  phoneNumber?: string;
  address?: string;
  parentName?: string;
  parentPhoneNumber?: string;
  enrollmentDate: string;
  registeredAt: string;
  status: StudentStatus;
  notes?: string;
  userId?: number;
  account?: {
    accountId?: number;
    accountEmail?: string;
    isDelete?: boolean;
  } | null;
};

export type GetAdminStudentsParams = {
  page: number;
  pageSize: number;
  keyword?: string;
  sortBy?: string;
  isDescending?: boolean;
  status?: StudentStatus;
  enrollmentDate?: string;
};

export type CreateAdminStudentPayload = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phoneNumber: string;
  address?: string | null;
  parentName?: string | null;
  parentPhoneNumber?: string | null;
  enrollmentDate: string;
  status: string;
  notes?: string | null;
  isAccountExists: boolean;
  account: {
    userId?: number | null;
    password?: string | null;
  };
};

type RawAdminStudent = Omit<
  AdminStudent,
  "id" | "registeredAt" | "enrollmentDate"
> & {
  id?: string;
  enrollmentDate?: string;
  registeredAt?: string;
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
  statusCode: number;
};

const normalizeStudent = (student: RawAdminStudent): AdminStudent => {
  const enrollmentDate = student.enrollmentDate ?? student.registeredAt ?? "";

  return {
    ...student,
    id: student.id ?? student.publicId,
    enrollmentDate,
    registeredAt: enrollmentDate,
  };
};

export const adminStudentsApi = {
  async getList(params: GetAdminStudentsParams) {
    const response = await api.get<ApiResult<PagedResult<RawAdminStudent>>>(
      ENDPOINTS.ADMIN_STUDENTS.GET_LIST,
      {
        params: {
          Page: params.page,
          PageSize: params.pageSize,
          Keyword: params.keyword || undefined,
          SortBy: params.sortBy,
          IsDescending: params.isDescending,
          Status: params.status,
          EnrollmentDate: params.enrollmentDate || undefined,
        },
      }
    );

    if (!response.data.isSuccess || !response.data.data) {
      throw new Error(response.data.error ?? "Không thể tải danh sách học viên.");
    }

    return {
      ...response.data.data,
      items: response.data.data.items.map(normalizeStudent),
    };
  },

  async create(payload: CreateAdminStudentPayload) {
    const response = await api.post<ApiResult<RawAdminStudent>>(
      ENDPOINTS.ADMIN_STUDENTS.CREATE,
      payload
    );

    if (!response.data.isSuccess || !response.data.data) {
      throw new Error(response.data.error ?? "Không thể tạo học viên.");
    }

    return normalizeStudent(response.data.data);
  },
};
