import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

export type DiscountType = "Percentage" | "FixedAmount" | string;

export type AdminDiscount = {
  publicId?: string;
  id: number;
  code: string;
  name?: string | null;
  type: DiscountType | number;
  value: number;
  validFrom?: string | null;
  validTo?: string | null;
  isActive: boolean;
  maxUsageCount?: number | null;
  usedCount?: number | null;
  maxUsagePerStudent?: number | null;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type DiscountFormPayload = {
  code: string;
  type: DiscountType;
  value: number;
  validFrom?: string | null;
  validTo?: string | null;
  isActive: boolean;
  maxUsageCount?: number | null;
  maxUsagePerStudent?: number | null;
  description?: string | null;
};

type PagedResult<T> = { items: T[]; page: number; pageSize: number; totalItems: number; totalPages: number };
type ApiResult<T> = { isSuccess: boolean; data?: T; error?: string };

const unwrap = <T>(response: ApiResult<T>, message: string) => {
  if (!response.isSuccess || response.data === undefined) throw new Error(response.error ?? message);
  return response.data;
};

export const adminDiscountsApi = {
  async getList(params: { page: number; pageSize: number; keyword?: string; type?: DiscountType; isActive?: boolean; isDescending?: boolean }) {
    const response = await api.get<ApiResult<PagedResult<AdminDiscount>>>(ENDPOINTS.ADMIN_DISCOUNTS.GET_LIST, {
      params: {
        Page: params.page,
        PageSize: params.pageSize,
        Keyword: params.keyword || undefined,
        Type: params.type,
        IsActive: params.isActive,
        IsDescending: params.isDescending,
      },
    });
    return unwrap(response.data, "Không thể tải danh sách giảm giá.");
  },

  async getById(id: string | number) {
    const response = await api.get<ApiResult<AdminDiscount>>(ENDPOINTS.ADMIN_DISCOUNTS.GET_BY_ID(id));
    return unwrap(response.data, "Không thể tải thông tin giảm giá.");
  },

  async create(payload: DiscountFormPayload) {
    const response = await api.post<ApiResult<AdminDiscount>>(ENDPOINTS.ADMIN_DISCOUNTS.CREATE, payload);
    return unwrap(response.data, "Không thể tạo giảm giá.");
  },

  async update(id: string | number, payload: DiscountFormPayload & { id: number }) {
    const response = await api.put<ApiResult<AdminDiscount>>(ENDPOINTS.ADMIN_DISCOUNTS.UPDATE(id), payload);
    return unwrap(response.data, "Không thể cập nhật giảm giá.");
  },

  async delete(id: string | number) {
    const response = await api.delete<ApiResult<boolean>>(ENDPOINTS.ADMIN_DISCOUNTS.DELETE(id));
    return unwrap(response.data, "Không thể xóa giảm giá.");
  },
};
