import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";
import type { AdminBillingPolicy } from "@/features/admin/billing-policies/api/admin-billing-policies-api";

export type ClassStatus = "Draft" | "Open" | "Ongoing" | "Completed" | "Cancelled";

export type AdminClass = {
  publicId: string;
  id: number;
  courseId: number;
  teacherId: number;
  roomId?: number | null;
  billingPolicyId?: number | null;
  billingPolicy?: AdminBillingPolicy | null;
  billingPolicyName?: string | null;
  billingPolicyType?: string | number | null;
  billingPolicyIsDefault?: boolean | null;
  effectiveBillingPolicyId?: number | null;
  effectiveBillingPolicyName?: string | null;
  effectiveBillingPolicyType?: string | number | null;
  effectiveBillingPolicyIsDefault?: boolean | null;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  capacity: number;
  tuitionFeeSnapshot: number;
  totalSessions: number;
  completedSessions: number;
  status: ClassStatus | number;
  openedAt?: string | null;
  closedAt?: string | null;
  notes?: string | null;
};

export type ClassFormPayload = {
  courseId: number;
  teacherId: number;
  roomId?: number | null;
  billingPolicyId?: number | null;
  name: string;
  startDate: string;
  endDate: string;
  capacity: number;
  tuitionFeeSnapshot?: number | null;
  totalSessions?: number | null;
  completedSessions: number;
  status: ClassStatus;
  openedAt?: string | null;
  closedAt?: string | null;
  notes?: string | null;
};

export type ClassStudent = {
  studentId?: number;
  enrollmentId?: number;
  studentCode: string;
  fullName: string;
  phoneNumber?: string | null;
  email?: string | null;
  status: string | number;
};

type PagedResult<T> = { items: T[]; page: number; pageSize: number; totalItems: number; totalPages: number };
type ApiResult<T> = { isSuccess: boolean; data?: T; error?: string };
const unwrap = <T>(response: ApiResult<T>, message: string) => {
  if (!response.isSuccess || response.data === undefined) throw new Error(response.error ?? message);
  return response.data;
};

export const adminClassesApi = {
  async getList(params: { page: number; pageSize: number; keyword?: string; sortBy?: string; isDescending?: boolean; courseId?: number; teacherId?: number; status?: ClassStatus }) {
    const response = await api.get<ApiResult<PagedResult<AdminClass>>>(ENDPOINTS.ADMIN_CLASSES.GET_LIST, {
      params: { Page: params.page, PageSize: params.pageSize, Keyword: params.keyword || undefined, SortBy: params.sortBy, IsDescending: params.isDescending, CourseId: params.courseId, TeacherId: params.teacherId, Status: params.status },
    });
    return unwrap(response.data, "Không thể tải danh sách lớp học.");
  },
  async getById(id: string | number) {
    const response = await api.get<ApiResult<AdminClass>>(ENDPOINTS.ADMIN_CLASSES.GET_BY_ID(id));
    return unwrap(response.data, "Không thể tải thông tin lớp học.");
  },
  async getStudents(classId: string | number) {
    const response = await api.get<ApiResult<ClassStudent[]>>(ENDPOINTS.ADMIN_CLASSES.GET_CLASS_STUDENTS, {
      params: { classId },
    });
    return unwrap(response.data, "Không thể tải danh sách học viên trong lớp.");
  },
  async create(payload: ClassFormPayload) {
    const response = await api.post<ApiResult<AdminClass>>(ENDPOINTS.ADMIN_CLASSES.CREATE, payload);
    return unwrap(response.data, "Không thể tạo lớp học.");
  },
  async update(id: string | number, payload: ClassFormPayload & { id: number }) {
    const response = await api.put<ApiResult<AdminClass>>(ENDPOINTS.ADMIN_CLASSES.UPDATE(id), payload);
    return unwrap(response.data, "Không thể cập nhật lớp học.");
  },
  async delete(id: string | number) {
    const response = await api.delete<ApiResult<boolean>>(ENDPOINTS.ADMIN_CLASSES.DELETE(id));
    return unwrap(response.data, "Không thể xóa lớp học.");
  },
};
