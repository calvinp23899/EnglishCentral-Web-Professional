import axios from "axios";

import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

export type AdminAccount = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
};

type RawAdminAccount = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
};

const normalizeAccount = (account: RawAdminAccount): AdminAccount => ({
  id: account.id,
  fullName: account.fullName,
  email: account.email,
  phoneNumber: account.phoneNumber,
});

export const adminAccountsApi = {
  async getAccounts(search: string) {
    try {
      const response = await api.get<RawAdminAccount[]>(
        ENDPOINTS.ADMIN_ACCOUNT.GET_ACCOUNT,
        {
          params: {
            search: search.trim(),
          },
        }
      );

      return response.data.map(normalizeAccount);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }

      throw error;
    }
  },
};
