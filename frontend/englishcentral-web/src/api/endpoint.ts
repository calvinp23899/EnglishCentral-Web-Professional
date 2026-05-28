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
    CREATE: "/admin/academic/students/insert",
  },

  ADMIN_METADATA: {
    STATUS: "/admin/metadata/status",
    GENDER: "/admin/metadata/gender-status",
  },
};
