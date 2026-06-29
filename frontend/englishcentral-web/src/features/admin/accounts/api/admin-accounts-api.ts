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
  async getStudentAccounts(search: string) {
    return getAccounts(ENDPOINTS.ADMIN_ACCOUNT.GET_STUDENT_ACCOUNT, search);
  },

  async getTeacherAccounts(search: string) {
    return getAccounts(ENDPOINTS.ADMIN_ACCOUNT.GET_TEACHER_ACCOUNT, search);
  },
};

const getAccounts = async (endpoint: string, search: string) => {
    try {
      const response = await api.get<RawAdminAccount[]>(
        endpoint,
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
};
