import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

export type BillingPolicyType = "FullPayment" | "Monthly" | "Installment" | "Custom";

export type AdminBillingPolicy = {
  publicId: string;
  id: number;
  name: string;
  type: BillingPolicyType | number;
  numberOfInstallments?: number | null;
  isDefault: boolean;
  isActive: boolean;
  notes?: string | null;
};

export type BillingPolicyFormPayload = {
  name: string;
  type: BillingPolicyType;
  numberOfInstallments?: number | null;
  isDefault: boolean;
  isActive: boolean;
  notes?: string | null;
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

export const adminBillingPoliciesApi = {
  async getList(params: {
    page: number;
    pageSize: number;
    keyword?: string;
    type?: BillingPolicyType;
    isActive?: boolean;
    isDescending?: boolean;
  }) {
    const response = await api.get<ApiResult<PagedResult<AdminBillingPolicy>>>(
      ENDPOINTS.ADMIN_BILLING_POLICIES.GET_LIST,
      {
        params: {
          Page: params.page,
          PageSize: params.pageSize,
          Keyword: params.keyword || undefined,
          Type: params.type,
          IsActive: params.isActive,
          IsDescending: params.isDescending,
        },
      },
    );
    return unwrap(response.data, "Không thể tải danh sách chính sách học phí.");
  },

  async getById(id: string | number) {
    const response = await api.get<ApiResult<AdminBillingPolicy>>(
      ENDPOINTS.ADMIN_BILLING_POLICIES.GET_BY_ID(id),
    );
    return unwrap(response.data, "Không thể tải thông tin chính sách học phí.");
  },

  async create(payload: BillingPolicyFormPayload) {
    const response = await api.post<ApiResult<AdminBillingPolicy>>(
      ENDPOINTS.ADMIN_BILLING_POLICIES.CREATE,
      payload,
    );
    return unwrap(response.data, "Không thể tạo chính sách học phí.");
  },

  async update(id: string | number, payload: BillingPolicyFormPayload & { id: number }) {
    const response = await api.put<ApiResult<AdminBillingPolicy>>(
      ENDPOINTS.ADMIN_BILLING_POLICIES.UPDATE(id),
      payload,
    );
    return unwrap(response.data, "Không thể cập nhật chính sách học phí.");
  },

  async delete(id: string | number) {
    const response = await api.delete<ApiResult<boolean>>(
      ENDPOINTS.ADMIN_BILLING_POLICIES.DELETE(id),
    );
    return unwrap(response.data, "Không thể xóa chính sách học phí.");
  },
};
