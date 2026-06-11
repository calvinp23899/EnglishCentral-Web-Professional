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

  async getDiscountTypeOptions() {
    const response = await api.get<MetadataOption[]>(
      ENDPOINTS.ADMIN_METADATA.DISCOUNT_TYPE
    );

    return response.data;
  },

  async getPaymentMethodOptions() {
    const response = await api.get<MetadataOption[]>(
      ENDPOINTS.ADMIN_METADATA.PAYMENT_METHOD
    );

    return response.data;
  },

  async getExamQuestionTypeOptions() {
    const response = await api.get<MetadataOption[]>(
      ENDPOINTS.ADMIN_METADATA.EXAM_QUESTION_TYPE
    );

    return response.data;
  },

  async getExamSkillOptions() {
    const response = await api.get<MetadataOption[]>(
      ENDPOINTS.ADMIN_METADATA.EXAM_SKILL
    );

    return response.data;
  },

  async getExamStimulusTypeOptions() {
    const response = await api.get<MetadataOption[]>(
      ENDPOINTS.ADMIN_METADATA.EXAM_STIMULUS_TYPE
    );

    return response.data;
  },

  async getExamScoringModeOptions() {
    const response = await api.get<MetadataOption[]>(
      ENDPOINTS.ADMIN_METADATA.EXAM_SCORING_MODE
    );

    return response.data;
  },

  async getExamFamilyOptions() {
    const response = await api.get<MetadataOption[]>(
      ENDPOINTS.ADMIN_METADATA.EXAM_FAMILY
    );

    return response.data;
  },

  async getExamTemplateStatusOptions() {
    const response = await api.get<MetadataOption[]>(
      ENDPOINTS.ADMIN_METADATA.EXAM_TEMPLATE_STATUS
    );

    return response.data;
  },

  async getExamVersionStatusOptions() {
    const response = await api.get<MetadataOption[]>(
      ENDPOINTS.ADMIN_METADATA.EXAM_VERSION_STATUS
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
