import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

export type MetadataOption = {
  label: string;
  value: string;
  code: number;
};

export type RoleMetadataOption = {
  roleId: number;
  roleName: string;
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

  async getTeacherStatusOptions() {
    const response = await api.get<MetadataOption[]>(
      ENDPOINTS.ADMIN_METADATA.TEACHER_STATUS
    );

    return response.data;
  },

  async getContractTypeOptions() {
    const response = await api.get<MetadataOption[]>(
      ENDPOINTS.ADMIN_METADATA.CONTRACT_TYPE
    );

    return response.data;
  },

  async getSalaryTypeOptions() {
    const response = await api.get<MetadataOption[]>(
      ENDPOINTS.ADMIN_METADATA.SALARY_TYPE
    );

    return response.data;
  },

  async getBillingPolicyTypeOptions() {
    const response = await api.get<MetadataOption[]>(
      ENDPOINTS.ADMIN_METADATA.BILLING_POLICY_TYPE
    );

    return response.data;
  },

  async getPaymentMethodOptions() {
    const response = await api.get<MetadataOption[]>(
      ENDPOINTS.ADMIN_METADATA.PAYMENT_METHOD
    );

    return response.data;
  },

  async getRoleOptions() {
    const response = await api.get<RoleMetadataOption[]>(
      ENDPOINTS.ADMIN_METADATA.ROLE
    );

    return response.data;
  },
};
