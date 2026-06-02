import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

export type EnrollmentStudentOption = {
  studentId: number;
  studentCode: string;
  fullName: string;
  phoneNumber?: string | null;
  email?: string | null;
  status: string | number;
};

type ApiResult<T> = { isSuccess: boolean; data?: T; error?: string };

const unwrap = <T>(response: ApiResult<T>, message: string) => {
  if (!response.isSuccess || response.data === undefined) throw new Error(response.error ?? message);
  return response.data;
};

export const adminEnrollmentsApi = {
  async searchStudents(search: string) {
    const response = await api.get<ApiResult<EnrollmentStudentOption[]>>(
      ENDPOINTS.ADMIN_STUDENTS.GET_LIST_ENROLLMENT,
      { params: { search: search || undefined } },
    );
    return unwrap(response.data, "Không thể tìm kiếm học viên.");
  },

  async create(studentId: number, classId: number) {
    const response = await api.post<ApiResult<unknown>>(ENDPOINTS.ADMIN_ENROLLMENTS.CREATE, {
      studentId,
      classId,
      enrollmentCode: null,
      enrolledAt: null,
      startDate: null,
      endDate: null,
      status: "Active",
      tuitionFee: 0,
      discountAmount: 0,
      finalAmount: 0,
      paidAmount: 0,
      outstandingAmount: 0,
      cancellationReason: null,
      cancelledAt: null,
      cancelledBy: null,
      notes: null,
      discounts: null,
      paymentPlan: null,
    });
    return unwrap(response.data, "Không thể đăng ký học viên vào lớp.");
  },
};
