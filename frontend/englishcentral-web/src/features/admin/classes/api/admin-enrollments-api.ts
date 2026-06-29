import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";
import { adminPaymentPlansApi } from "@/features/admin/payment-plans/api/admin-payment-plans-api";
import type { AdminEnrollment } from "@/features/admin/enrollments/api/admin-enrollment-finance-api";

export type EnrollmentPaymentPlanPayload = {
  billingPolicyId?: number | null;
  type: "FullPayment" | "Monthly" | "Installment";
  numberOfInstallments?: number | null;
  notes?: string | null;
  items?: Array<{
    sequenceNumber: number;
    name: string;
    dueDate: string;
    amount: number;
  }>;
};

export type EnrollmentDiscountPayload = {
  discountId?: number | null;
  name?: string | null;
  type: "FixedAmount" | "Percentage";
  value: number;
  amount?: number | null;
  reason?: string | null;
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
type PagedResult<T> = { items: T[]; page: number; pageSize: number; totalItems: number; totalPages: number };

const unwrap = <T>(response: ApiResult<T>, message: string) => {
  if (!response.isSuccess || response.data === undefined) throw new Error(response.error ?? message);
  return response.data;
};

export const adminEnrollmentsApi = {
  async getByClass(classId: string | number) {
    const response = await api.get<ApiResult<PagedResult<AdminEnrollment>>>(ENDPOINTS.ADMIN_ENROLLMENTS.GET_LIST, {
      params: { Page: 1, PageSize: 100, ClassId: classId },
    });
    return unwrap(response.data, "Không thể tải danh sách đăng ký của lớp.");
  },

  async searchStudents(search: string) {
    const response = await api.get<ApiResult<EnrollmentStudentOption[]>>(
      ENDPOINTS.ADMIN_STUDENTS.GET_LIST_ENROLLMENT,
      { params: { search: search || undefined } },
    );
    return unwrap(response.data, "Không thể tìm kiếm học viên.");
  },

  async create(studentId: number, classId: number, tuitionFee: number, paymentPlan?: EnrollmentPaymentPlanPayload | null, discounts?: EnrollmentDiscountPayload[] | null) {
    const response = await api.post<ApiResult<AdminEnrollment>>(ENDPOINTS.ADMIN_ENROLLMENTS.CREATE, {
      studentId,
      classId,
      enrollmentCode: null,
      enrolledAt: null,
      startDate: null,
      endDate: null,
      status: "Active",
      tuitionFee,
      discountAmount: 0,
      finalAmount: 0,
      paidAmount: 0,
      outstandingAmount: 0,
      cancellationReason: null,
      cancelledAt: null,
      cancelledBy: null,
      notes: null,
      discounts: discounts && discounts.length > 0 ? discounts : null,
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

  async cancel(id: string | number, reason: string) {
    const response = await api.post<ApiResult<boolean>>(ENDPOINTS.ADMIN_ENROLLMENTS.CANCEL(id), {
      cancellationReason: reason,
    });
    return unwrap(response.data, "Không thể hủy đăng ký học viên.");
  },
};
