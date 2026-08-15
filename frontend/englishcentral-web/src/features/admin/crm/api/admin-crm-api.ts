import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

export type LeadSourceChannel = "Ads" | "Organic" | "Referral" | "Offline" | "Partner" | "Other" | number;
export type LeadStatus = "New" | "Contacted" | "Interested" | "TrialScheduled" | "Converted" | "Lost" | number;
export type LeadLostReason =
  | "TooExpensive"
  | "NoResponse"
  | "ScheduleNotFit"
  | "ChoseCompetitor"
  | "NotReady"
  | "InvalidContact"
  | "Other"
  | number;
export type LeadActivityType = "Call" | "Message" | "Zalo" | "Email" | "Meeting" | "Trial" | "Note" | number;

export type AdminLeadSource = {
  publicId: string;
  id: number;
  code: string;
  name: string;
  channel: LeadSourceChannel;
  campaignName?: string | null;
  description?: string | null;
  cost?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
};

export type AdminLeadActivity = {
  publicId: string;
  id: number;
  leadId: number;
  activityType: LeadActivityType;
  note?: string | null;
  outcome?: string | null;
  nextFollowUpAt?: string | null;
  createdByUserId: number;
  createdByUserName?: string | null;
  createdAt: string;
};

export type AdminLeadConversion = {
  publicId: string;
  id: number;
  leadId: number;
  studentId: number;
  studentCode?: string | null;
  studentName?: string | null;
  enrollmentId?: number | null;
  enrollmentCode?: string | null;
  convertedByUserId: number;
  convertedByUserName?: string | null;
  convertedAt: string;
  sourceIdSnapshot?: number | null;
  sourceNameSnapshot?: string | null;
  channelSnapshot?: string | null;
  courseIdSnapshot?: number | null;
  courseNameSnapshot?: string | null;
  revenueSnapshot?: number | null;
  note?: string | null;
  createdAt: string;
};

export type AdminLead = {
  publicId: string;
  id: number;
  leadCode: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  leadSourceId: number;
  leadSourceName: string;
  leadSourceChannel: LeadSourceChannel;
  assignedToUserId?: number | null;
  assignedToUserName?: string | null;
  interestedCourseId?: number | null;
  interestedCourseName?: string | null;
  status: LeadStatus;
  demandNote?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  referrerUrl?: string | null;
  landingPageUrl?: string | null;
  lastContactAt?: string | null;
  nextFollowUpAt?: string | null;
  lostReason?: LeadLostReason | null;
  lostReasonNote?: string | null;
  convertedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  activities: AdminLeadActivity[];
  conversion?: AdminLeadConversion | null;
};

export type LeadSourcePayload = {
  name: string;
  channel: string;
  campaignName?: string | null;
  description?: string | null;
  cost?: number | null;
  isActive: boolean;
};

export type LeadPayload = {
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  leadSourceId: number;
  assignedToUserId?: number | null;
  interestedCourseId?: number | null;
  status?: string;
  demandNote?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  referrerUrl?: string | null;
  landingPageUrl?: string | null;
  nextFollowUpAt?: string | null;
  lostReason?: string | null;
  lostReasonNote?: string | null;
};

export type CreateLeadActivityPayload = {
  activityType: string;
  note?: string | null;
  outcome?: string | null;
  nextFollowUpAt?: string | null;
  createdByUserId: number;
};

export type MarkLeadLostPayload = {
  lostReason: string;
  lostReasonNote?: string | null;
};

export type ConvertLeadPayload = {
  studentId: number;
  enrollmentId?: number | null;
  convertedByUserId: number;
  revenueSnapshot?: number | null;
  note?: string | null;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

type ApiResult<T> = {
  isSuccess: boolean;
  data?: T;
  error?: string;
};

const unwrap = <T>(response: ApiResult<T>, fallbackMessage: string) => {
  if (!response.isSuccess || response.data === undefined) {
    throw new Error(response.error ?? fallbackMessage);
  }

  return response.data;
};

export const leadSourceChannelOptions = [
  { value: "Ads", label: "Quảng cáo" },
  { value: "Organic", label: "Tự nhiên" },
  { value: "Referral", label: "Giới thiệu" },
  { value: "Offline", label: "Offline" },
  { value: "Partner", label: "Đối tác" },
  { value: "Other", label: "Khác" },
];

export const leadStatusOptions = [
  { value: "New", label: "Mới" },
  { value: "Contacted", label: "Đã liên hệ" },
  { value: "Interested", label: "Quan tâm" },
  { value: "TrialScheduled", label: "Đã hẹn học thử" },
  { value: "Converted", label: "Đã chuyển đổi" },
  { value: "Lost", label: "Thất bại" },
];

export const leadLostReasonOptions = [
  { value: "TooExpensive", label: "Chi phí cao" },
  { value: "NoResponse", label: "Không phản hồi" },
  { value: "ScheduleNotFit", label: "Không phù hợp lịch" },
  { value: "ChoseCompetitor", label: "Chọn đối thủ" },
  { value: "NotReady", label: "Chưa sẵn sàng" },
  { value: "InvalidContact", label: "Thông tin liên hệ không hợp lệ" },
  { value: "Other", label: "Khác" },
];

export const leadActivityTypeOptions = [
  { value: "Call", label: "Gọi điện" },
  { value: "Message", label: "Tin nhắn" },
  { value: "Zalo", label: "Zalo" },
  { value: "Email", label: "Email" },
  { value: "Meeting", label: "Gặp mặt" },
  { value: "Trial", label: "Học thử" },
  { value: "Note", label: "Ghi chú" },
];

const enumMaps = {
  channel: ["", "Ads", "Organic", "Referral", "Offline", "Partner", "Other"],
  status: ["", "New", "Contacted", "Interested", "TrialScheduled", "Converted", "Lost"],
  lostReason: ["", "TooExpensive", "NoResponse", "ScheduleNotFit", "ChoseCompetitor", "NotReady", "InvalidContact", "Other"],
  activityType: ["", "Call", "Message", "Zalo", "Email", "Meeting", "Trial", "Note"],
};

const normalizeEnum = (value: string | number | null | undefined, values: string[]) =>
  typeof value === "number" ? values[value] ?? String(value) : String(value ?? "");

const labelFrom = (options: { value: string; label: string }[], value?: string | number | null, values?: string[]) => {
  const normalized = values ? normalizeEnum(value, values) : String(value ?? "");
  return options.find((option) => option.value === normalized)?.label ?? (normalized || "Chưa cập nhật");
};

export const getLeadSourceChannelValue = (value?: string | number | null) =>
  normalizeEnum(value, enumMaps.channel);
export const getLeadStatusValue = (value?: string | number | null) =>
  normalizeEnum(value, enumMaps.status);
export const getLeadLostReasonValue = (value?: string | number | null) =>
  normalizeEnum(value, enumMaps.lostReason);
export const getLeadActivityTypeValue = (value?: string | number | null) =>
  normalizeEnum(value, enumMaps.activityType);
export const getLeadSourceChannelLabel = (value?: string | number | null) =>
  labelFrom(leadSourceChannelOptions, value, enumMaps.channel);
export const getLeadStatusLabel = (value?: string | number | null) =>
  labelFrom(leadStatusOptions, value, enumMaps.status);
export const getLeadLostReasonLabel = (value?: string | number | null) =>
  labelFrom(leadLostReasonOptions, value, enumMaps.lostReason);
export const getLeadActivityTypeLabel = (value?: string | number | null) =>
  labelFrom(leadActivityTypeOptions, value, enumMaps.activityType);

export const adminCrmApi = {
  leadSources: {
    async getList(params: { page: number; pageSize: number; keyword?: string; channel?: string; isActive?: boolean; isDescending?: boolean }) {
      const response = await api.get<ApiResult<PagedResult<AdminLeadSource>>>(ENDPOINTS.ADMIN_CRM.LEAD_SOURCES.GET_LIST, {
        params: { Page: params.page, PageSize: params.pageSize, Keyword: params.keyword || undefined, Channel: params.channel, IsActive: params.isActive, IsDescending: params.isDescending },
      });
      return unwrap(response.data, "Không thể tải danh sách nguồn lead.");
    },
    async getById(id: string | number) {
      const response = await api.get<ApiResult<AdminLeadSource>>(ENDPOINTS.ADMIN_CRM.LEAD_SOURCES.GET_BY_ID(id));
      return unwrap(response.data, "Không thể tải thông tin nguồn lead.");
    },
    async create(payload: LeadSourcePayload) {
      const response = await api.post<ApiResult<AdminLeadSource>>(ENDPOINTS.ADMIN_CRM.LEAD_SOURCES.CREATE, payload);
      return unwrap(response.data, "Không thể tạo nguồn lead.");
    },
    async update(id: string | number, payload: LeadSourcePayload & { id: number }) {
      const response = await api.put<ApiResult<AdminLeadSource>>(ENDPOINTS.ADMIN_CRM.LEAD_SOURCES.UPDATE(id), payload);
      return unwrap(response.data, "Không thể cập nhật nguồn lead.");
    },
    async delete(id: string | number) {
      const response = await api.delete<ApiResult<boolean>>(ENDPOINTS.ADMIN_CRM.LEAD_SOURCES.DELETE(id));
      return unwrap(response.data, "Không thể xóa nguồn lead.");
    },
  },
  leads: {
    async getList(params: { page: number; pageSize: number; keyword?: string; status?: string; lostReason?: string; leadSourceId?: number; assignedToUserId?: number; interestedCourseId?: number; createdFrom?: string; createdTo?: string; nextFollowUpFrom?: string; nextFollowUpTo?: string; isDescending?: boolean }) {
      const response = await api.get<ApiResult<PagedResult<AdminLead>>>(ENDPOINTS.ADMIN_CRM.LEADS.GET_LIST, {
        params: {
          Page: params.page,
          PageSize: params.pageSize,
          Keyword: params.keyword || undefined,
          Status: params.status,
          LostReason: params.lostReason,
          LeadSourceId: params.leadSourceId,
          AssignedToUserId: params.assignedToUserId,
          InterestedCourseId: params.interestedCourseId,
          CreatedFrom: params.createdFrom || undefined,
          CreatedTo: params.createdTo || undefined,
          NextFollowUpFrom: params.nextFollowUpFrom || undefined,
          NextFollowUpTo: params.nextFollowUpTo || undefined,
          IsDescending: params.isDescending,
        },
      });
      return unwrap(response.data, "Không thể tải danh sách lead.");
    },
    async getById(id: string | number) {
      const response = await api.get<ApiResult<AdminLead>>(ENDPOINTS.ADMIN_CRM.LEADS.GET_BY_ID(id));
      return unwrap(response.data, "Không thể tải thông tin lead.");
    },
    async create(payload: LeadPayload) {
      const response = await api.post<ApiResult<AdminLead>>(ENDPOINTS.ADMIN_CRM.LEADS.CREATE, payload);
      return unwrap(response.data, "Không thể tạo lead.");
    },
    async update(id: string | number, payload: LeadPayload & { id: number; status: string }) {
      const response = await api.put<ApiResult<AdminLead>>(ENDPOINTS.ADMIN_CRM.LEADS.UPDATE(id), payload);
      return unwrap(response.data, "Không thể cập nhật lead.");
    },
    async createActivity(id: string | number, payload: CreateLeadActivityPayload) {
      const response = await api.post<ApiResult<AdminLeadActivity>>(ENDPOINTS.ADMIN_CRM.LEADS.CREATE_ACTIVITY(id), payload);
      return unwrap(response.data, "Không thể thêm hoạt động lead.");
    },
    async markLost(id: string | number, payload: MarkLeadLostPayload) {
      const response = await api.post<ApiResult<AdminLead>>(ENDPOINTS.ADMIN_CRM.LEADS.MARK_LOST(id), payload);
      return unwrap(response.data, "Không thể đánh dấu lead thất bại.");
    },
    async convert(id: string | number, payload: ConvertLeadPayload) {
      const response = await api.post<ApiResult<AdminLeadConversion>>(ENDPOINTS.ADMIN_CRM.LEADS.CONVERT(id), payload);
      return unwrap(response.data, "Không thể chuyển đổi lead.");
    },
    async delete(id: string | number) {
      const response = await api.delete<ApiResult<boolean>>(ENDPOINTS.ADMIN_CRM.LEADS.DELETE(id));
      return unwrap(response.data, "Không thể xóa lead.");
    },
  },
  leadConversions: {
    async getList(params: { page: number; pageSize: number; leadSourceId?: number; convertedByUserId?: number; convertedFrom?: string; convertedTo?: string; isDescending?: boolean }) {
      const response = await api.get<ApiResult<PagedResult<AdminLeadConversion>>>(ENDPOINTS.ADMIN_CRM.LEAD_CONVERSIONS.GET_LIST, {
        params: { Page: params.page, PageSize: params.pageSize, LeadSourceId: params.leadSourceId, ConvertedByUserId: params.convertedByUserId, ConvertedFrom: params.convertedFrom || undefined, ConvertedTo: params.convertedTo || undefined, IsDescending: params.isDescending },
      });
      return unwrap(response.data, "Không thể tải danh sách chuyển đổi lead.");
    },
    async getById(id: string | number) {
      const response = await api.get<ApiResult<AdminLeadConversion>>(ENDPOINTS.ADMIN_CRM.LEAD_CONVERSIONS.GET_BY_ID(id));
      return unwrap(response.data, "Không thể tải thông tin chuyển đổi lead.");
    },
  },
};
