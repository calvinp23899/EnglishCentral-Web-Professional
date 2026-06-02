import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

export type AdminRoom = { id: number; code: string; name: string; capacity: number; building?: string | null; floor?: number | null; isActive: boolean };
type ApiResult<T> = { isSuccess: boolean; data?: T; error?: string };
type PagedResult<T> = { items: T[] };

export const adminRoomsApi = {
  async getList() {
    const response = await api.get<ApiResult<PagedResult<AdminRoom>>>(ENDPOINTS.ADMIN_ROOMS.GET_LIST, {
      params: { Page: 1, PageSize: 1000, IsActive: true, SortBy: "name", IsDescending: false },
    });
    if (!response.data.isSuccess || !response.data.data) throw new Error(response.data.error ?? "Không thể tải danh sách phòng học.");
    return response.data.data.items;
  },
};
