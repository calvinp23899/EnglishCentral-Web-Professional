import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

export type AdminRoom = {
  publicId?: string;
  id: number;
  code: string;
  name: string;
  capacity: number;
  building?: string | null;
  floor?: number | null;
  isActive: boolean;
};

export type RoomFormPayload = {
  name: string;
  capacity: number;
  building?: string | null;
  floor?: number | null;
  isActive: boolean;
};

export type UpdateRoomPayload = RoomFormPayload & {
  id: number;
};

type ApiResult<T> = {
  isSuccess: boolean;
  data?: T;
  error?: string;
};

type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

const unwrap = <T>(response: ApiResult<T>, fallbackMessage: string) => {
  if (!response.isSuccess || response.data === undefined) {
    throw new Error(response.error ?? fallbackMessage);
  }

  return response.data;
};

export const adminRoomsApi = {
  async getPagedList(params: {
    page: number;
    pageSize: number;
    keyword?: string;
    sortBy?: string;
    isDescending?: boolean;
    isActive?: boolean;
  }) {
    const response = await api.get<ApiResult<PagedResult<AdminRoom>>>(
      ENDPOINTS.ADMIN_ROOMS.GET_LIST,
      {
        params: {
          Page: params.page,
          PageSize: params.pageSize,
          Keyword: params.keyword || undefined,
          SortBy: params.sortBy,
          IsDescending: params.isDescending,
          IsActive: params.isActive,
        },
      },
    );

    return unwrap(response.data, "Không thể tải danh sách phòng học.");
  },

  async getList() {
    const response = await api.get<ApiResult<PagedResult<AdminRoom>>>(
      ENDPOINTS.ADMIN_ROOMS.GET_LIST,
      {
        params: {
          Page: 1,
          PageSize: 1000,
          IsActive: true,
          SortBy: "name",
          IsDescending: false,
        },
      },
    );

    return unwrap(response.data, "Không thể tải danh sách phòng học.").items;
  },

  async getById(id: string | number) {
    const response = await api.get<ApiResult<AdminRoom>>(ENDPOINTS.ADMIN_ROOMS.GET_BY_ID(id));
    return unwrap(response.data, "Không thể tải thông tin phòng học.");
  },

  async create(payload: RoomFormPayload) {
    const response = await api.post<ApiResult<AdminRoom>>(ENDPOINTS.ADMIN_ROOMS.CREATE, payload);
    return unwrap(response.data, "Không thể tạo phòng học.");
  },

  async update(id: string | number, payload: UpdateRoomPayload) {
    const response = await api.put<ApiResult<AdminRoom>>(ENDPOINTS.ADMIN_ROOMS.UPDATE(id), payload);
    return unwrap(response.data, "Không thể cập nhật phòng học.");
  },

  async delete(id: string | number) {
    const response = await api.delete<ApiResult<boolean>>(ENDPOINTS.ADMIN_ROOMS.DELETE(id));
    return unwrap(response.data, "Không thể xóa phòng học.");
  },
};
