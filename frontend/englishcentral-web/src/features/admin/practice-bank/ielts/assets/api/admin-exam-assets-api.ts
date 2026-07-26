import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

type ApiResult<T> = {
  isSuccess?: boolean;
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type MetadataOption = {
  label?: string;
  name?: string;
  value: string | number;
  code?: string | number;
};

export type ExamAsset = {
  id: number;
  publicId?: string | null;
  fileName?: string | null;
  originalFileName?: string | null;
  name?: string | null;
  displayName?: string | null;
  assetType?: string | number | null;
  provider?: string | number | null;
  status?: string | number | null;
  publicUrl?: string | null;
  url?: string | null;
  assetUrl?: string | null;
  fileUrl?: string | null;
  durationSeconds?: number | null;
  metadataJson?: string | Record<string, unknown> | null;
  contentType?: string | null;
  fileSize?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ExamAssetListParams = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  assetType?: string | number;
  provider?: string | number;
  status?: string | number;
};

export type ExamAssetUpdatePayload = {
  assetType?: string | number;
  provider?: string | number | null;
  status?: string | number | null;
  durationSeconds?: number | null;
  metadataJson?: string | null;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

const unwrap = <T>(response: ApiResult<T> | T, fallbackMessage: string): T => {
  const maybeResult = response as ApiResult<T>;

  if (
    maybeResult &&
    typeof maybeResult === "object" &&
    ("isSuccess" in maybeResult || "success" in maybeResult || "data" in maybeResult)
  ) {
    const isSuccess = maybeResult.isSuccess ?? maybeResult.success ?? true;

    if (!isSuccess || maybeResult.data === undefined) {
      throw new Error(maybeResult.error ?? maybeResult.message ?? fallbackMessage);
    }

    return maybeResult.data;
  }

  return response as T;
};

const normalizePaged = <T>(
  raw: unknown,
  fallbackPage = 1,
  fallbackPageSize = 10,
): PagedResult<T> => {
  if (Array.isArray(raw)) {
    return {
      items: raw as T[],
      page: fallbackPage,
      pageSize: fallbackPageSize,
      totalItems: raw.length,
      totalPages: Math.max(1, Math.ceil(raw.length / fallbackPageSize)),
    };
  }

  const value = raw as {
    items?: T[];
    data?: T[];
    records?: T[];
    list?: T[];
    page?: number;
    pageNumber?: number;
    pageSize?: number;
    totalItems?: number;
    totalCount?: number;
    total?: number;
    totalPages?: number;
  };

  const items = value.items ?? value.data ?? value.records ?? value.list ?? [];
  const pageSize = value.pageSize ?? fallbackPageSize;
  const totalItems = value.totalItems ?? value.totalCount ?? value.total ?? items.length;

  return {
    items,
    page: value.page ?? value.pageNumber ?? fallbackPage,
    pageSize,
    totalItems,
    totalPages: value.totalPages ?? Math.max(1, Math.ceil(totalItems / pageSize)),
  };
};

const buildListParams = (params: ExamAssetListParams) => ({
  Page: params.page ?? 1,
  PageSize: params.pageSize ?? 10,
  ...(params.keyword ? { Search: params.keyword, Keyword: params.keyword } : {}),
  ...(params.assetType ? { AssetType: params.assetType } : {}),
  ...(params.provider ? { Provider: params.provider } : {}),
  ...(params.status ? { Status: params.status } : {}),
});

export const adminExamAssetsApi = {
  async getAssetTypes() {
    const response = await api.get<ApiResult<MetadataOption[]>>(
      ENDPOINTS.ADMIN_METADATA.EXAM_ASSET_TYPE,
    );

    return unwrap(response.data, "Không thể tải metadata loại asset.");
  },

  async getAssetProviders() {
    const response = await api.get<ApiResult<MetadataOption[]>>(
      ENDPOINTS.ADMIN_METADATA.EXAM_ASSET_PROVIDER,
    );

    return unwrap(response.data, "Không thể tải metadata provider asset.");
  },

  async getAssetStatuses() {
    const response = await api.get<ApiResult<MetadataOption[]>>(
      ENDPOINTS.ADMIN_METADATA.EXAM_ASSET_STATUS,
    );

    return unwrap(response.data, "Không thể tải metadata trạng thái asset.");
  },

  async getAssets(params: ExamAssetListParams = {}) {
    const response = await api.get<ApiResult<PagedResult<ExamAsset>> | PagedResult<ExamAsset>>(
      ENDPOINTS.ADMIN_EXAM_ASSETS.GET_LIST,
      { params: buildListParams(params) },
    );

    const data = unwrap(response.data, "Không thể tải danh sách audio.");

    return normalizePaged<ExamAsset>(data, params.page, params.pageSize);
  },

  async getAssetById(id: number) {
    const response = await api.get<ApiResult<ExamAsset>>(
      ENDPOINTS.ADMIN_EXAM_ASSETS.GET_BY_ID(id),
    );

    return unwrap(response.data, "Không thể tải chi tiết audio.");
  },

  async uploadAsset(formData: FormData) {
    const response = await api.post<ApiResult<ExamAsset>>(
      ENDPOINTS.ADMIN_EXAM_ASSETS.UPLOAD,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    return unwrap(response.data, "Không thể upload audio.");
  },

  async updateAsset(id: number, payload: ExamAssetUpdatePayload) {
    const response = await api.put<ApiResult<ExamAsset>>(
      ENDPOINTS.ADMIN_EXAM_ASSETS.UPDATE(id),
      payload,
    );

    return unwrap(response.data, "Không thể cập nhật audio.");
  },

  async deleteAsset(id: number) {
    const response = await api.delete<ApiResult<unknown>>(
      ENDPOINTS.ADMIN_EXAM_ASSETS.DELETE(id),
    );

    return unwrap(response.data, "Không thể xóa audio.");
  },
};
