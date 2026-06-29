import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

export type AdminTeacherProfile = {
  publicId?: string;
  teacherCode?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string | number;
  address?: string;
  nationalId?: string;
  specialization?: string;
  bio?: string;
  degree?: string;
  yearsOfExperience?: number;
  certifications?: string[];
  hireDate?: string;
  status?: string | number;
  account?: {
    accountEmail?: string;
    isActive?: boolean;
  };
};

export type AdminMeProfile = {
  publicId: string;
  email: string;
  phoneNumber?: string;
  fullName: string;
  teacher?: AdminTeacherProfile | null;
};

export const adminProfileApi = {
  async getMeProfile() {
    const response = await api.get<AdminMeProfile>(
      ENDPOINTS.ADMIN_AUTH.ME_PROFILE
    );

    return response.data;
  },
};
