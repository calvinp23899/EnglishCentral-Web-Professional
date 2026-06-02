import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";
import { adminPaymentPlansApi } from "@/features/admin/payment-plans/api/admin-payment-plans-api";
import type { AdminEnrollment } from "@/features/admin/enrollments/api/admin-enrollment-finance-api";

export type EnrollmentPaymentPlanPayload = {
  billingPolicyId?: number | null;
  type: number;
  numberOfInstallments?: number | null;
  notes?: string | null;
  items: Array<{
    sequenceNumber: number;
    name: string;
    dueDate: string;
    amount: number;
  }>;
};

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

  async create(studentId: number, classId: number, paymentPlan?: EnrollmentPaymentPlanPayload | null) {
    const response = await api.post<ApiResult<AdminEnrollment>>(ENDPOINTS.ADMIN_ENROLLMENTS.CREATE, {
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
      paymentPlan: paymentPlan ?? null,
    });
    const enrollment = unwrap(response.data, "Không thể đăng ký học viên vào lớp.");
    const plans = await adminPaymentPlansApi.getList({
      page: 1,
      pageSize: 1,
      enrollmentId: enrollment.id,
    });

    return { enrollment, paymentPlan: plans.items[0] ?? null };
  },
};
