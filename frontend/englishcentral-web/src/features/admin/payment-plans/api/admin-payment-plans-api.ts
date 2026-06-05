import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

export type PaymentPlanType = "FullPayment" | "Monthly" | "Installment";
export type PaymentPlanStatus = "Draft" | "Active" | "Completed" | "Cancelled";
export type PaymentPlanItemStatus = "Pending" | "Invoiced" | "Paid" | "Overdue" | "Cancelled";

export type AdminPaymentPlanItem = {
  publicId: string;
  id: number;
  sequenceNumber: number;
  name: string;
  dueDate: string;
  amount: number;
  status: PaymentPlanItemStatus | number;
  invoiceId?: number | null;
};

export type AdminPaymentPlan = {
  publicId: string;
  id: number;
  enrollmentId: number;
  billingPolicyId?: number | null;
  type: PaymentPlanType | number;
  totalAmount: number;
  numberOfInstallments?: number | null;
  status: PaymentPlanStatus | number;
  notes?: string | null;
  items: AdminPaymentPlanItem[];
};

export type PaymentPlanFormPayload = {
  enrollmentId: number;
  billingPolicyId?: number | null;
  type: PaymentPlanType;
  totalAmount: number;
  numberOfInstallments?: number | null;
  status: PaymentPlanStatus;
  notes?: string | null;
  items: Array<{
    sequenceNumber: number;
    name: string;
    dueDate: string;
    amount: number;
    status: PaymentPlanItemStatus;
  }>;
};

type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

type ApiResult<T> = { isSuccess: boolean; data?: T; error?: string };

const unwrap = <T>(response: ApiResult<T>, message: string) => {
  if (!response.isSuccess || response.data === undefined) {
    throw new Error(response.error ?? message);
  }

  return response.data;
};

export const adminPaymentPlansApi = {
  async getList(params: {
    page: number;
    pageSize: number;
    enrollmentId?: number;
    type?: PaymentPlanType;
    status?: PaymentPlanStatus;
    isDescending?: boolean;
  }) {
    const response = await api.get<ApiResult<PagedResult<AdminPaymentPlan>>>(
      ENDPOINTS.ADMIN_PAYMENT_PLANS.GET_LIST,
      {
        params: {
          Page: params.page,
          PageSize: params.pageSize,
          enrollmentId: params.enrollmentId,
          Type: params.type,
          Status: params.status,
          IsDescending: params.isDescending,
        },
      },
    );

    return unwrap(response.data, "Không thể tải danh sách kế hoạch thanh toán.");
  },

  async getById(id: string | number) {
    const response = await api.get<ApiResult<AdminPaymentPlan>>(
      ENDPOINTS.ADMIN_PAYMENT_PLANS.GET_BY_ID(id),
    );
    return unwrap(response.data, "Không thể tải thông tin kế hoạch thanh toán.");
  },

  async create(payload: PaymentPlanFormPayload) {
    const response = await api.post<ApiResult<AdminPaymentPlan>>(
      ENDPOINTS.ADMIN_PAYMENT_PLANS.CREATE,
      payload,
    );
    return unwrap(response.data, "Không thể tạo kế hoạch thanh toán.");
  },

  async update(id: string | number, payload: PaymentPlanFormPayload & { id: number }) {
    const response = await api.put<ApiResult<AdminPaymentPlan>>(
      ENDPOINTS.ADMIN_PAYMENT_PLANS.UPDATE(id),
      payload,
    );
    return unwrap(response.data, "Không thể cập nhật kế hoạch thanh toán.");
  },

  async delete(id: string | number) {
    const response = await api.delete<ApiResult<boolean>>(
      ENDPOINTS.ADMIN_PAYMENT_PLANS.DELETE(id),
    );
    return unwrap(response.data, "Không thể xóa kế hoạch thanh toán.");
  },
};
