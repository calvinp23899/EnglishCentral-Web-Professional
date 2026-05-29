export const ENDPOINTS = {
  AUTH: {
    REGISTER: "/Auth/register",
    LOGIN: "/Auth/login",
    LOGOUT: "/Auth/logout",
    REFRESH: "/Auth/refresh",
    ME: "/Auth/me",
  },

  ADMIN_AUTH: {
    ME_PROFILE: "/admin/Auth/me-profile",
  },

  STUDENTS: {
    GET_ALL: "/students",
  },

  ADMIN_STUDENTS: {
    GET_LIST: "/admin/academic/students/get-list",
    GET_BY_ID: (id: string | number) => `/admin/academic/students/${id}/get-by-id`,
    CREATE: "/admin/academic/students/insert",
    UPDATE: (id: string | number) => `/admin/academic/students/${id}/update`,
    DELETE: (id: string | number) => `/admin/academic/students/${id}/delete`,
  },

  ADMIN_ACCOUNT: {
    GET_ACCOUNT: "/admin/account/get-account",
  },

  ADMIN_METADATA: {
    STATUS: "/admin/metadata/status",
    GENDER: "/admin/metadata/gender-status",
  },
};
