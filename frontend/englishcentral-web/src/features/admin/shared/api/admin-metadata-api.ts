import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

export type MetadataOption = {
  label: string;
  value: string;
  code: number;
};

export const adminMetadataApi = {
  async getStatusOptions() {
    const response = await api.get<MetadataOption[]>(
      ENDPOINTS.ADMIN_METADATA.STATUS
    );

    return response.data;
  },

  async getGenderOptions() {
    const response = await api.get<MetadataOption[]>(
      ENDPOINTS.ADMIN_METADATA.GENDER
    );

    return response.data;
  },
};
