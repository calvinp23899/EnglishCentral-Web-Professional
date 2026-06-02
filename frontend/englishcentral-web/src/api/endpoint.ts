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
    GET_LIST_ENROLLMENT: "/admin/academic/students/get-student-list-enrollment",
    GET_BY_ID: (id: string | number) => `/admin/academic/students/${id}/get-by-id`,
    CREATE: "/admin/academic/students/insert",
    UPDATE: (id: string | number) => `/admin/academic/students/${id}/update`,
    DELETE: (id: string | number) => `/admin/academic/students/${id}/delete`,
  },

  ADMIN_TEACHERS: {
    GET_LIST: "/admin/academic/teachers/get-list",
    GET_BY_ID: (id: string | number) => `/admin/academic/teachers/${id}/get-by-id`,
    CREATE: "/admin/academic/teachers/insert",
    UPDATE: (id: string | number) => `/admin/academic/teachers/${id}/update`,
    DELETE: (id: string | number) => `/admin/academic/teachers/${id}/delete`,
  },

  ADMIN_COURSE_CATEGORIES: {
    GET_LIST: "/admin/academic/course-categories/get-list",
    GET_BY_ID: (id: string | number) =>
      `/admin/academic/course-categories/${id}/get-by-id`,
    CREATE: "/admin/academic/course-categories/insert",
    UPDATE: (id: string | number) =>
      `/admin/academic/course-categories/${id}/update`,
    DELETE: (id: string | number) =>
      `/admin/academic/course-categories/${id}/delete`,
  },

  ADMIN_COURSES: {
    GET_LIST: "/admin/academic/courses/get-list",
    GET_BY_ID: (id: string | number) => `/admin/academic/courses/${id}/get-by-id`,
    CREATE: "/admin/academic/courses/insert",
    UPDATE: (id: string | number) => `/admin/academic/courses/${id}/update`,
    DELETE: (id: string | number) => `/admin/academic/courses/${id}/delete`,
  },

  ADMIN_CLASSES: {
    GET_LIST: "/admin/academic/classes/get-list",
    GET_CLASS_STUDENTS: "/admin/academic/classes/get-class-students",
    GET_BY_ID: (id: string | number) => `/admin/academic/classes/${id}/get-by-id`,
    CREATE: "/admin/academic/classes/insert",
    UPDATE: (id: string | number) => `/admin/academic/classes/${id}/update`,
    DELETE: (id: string | number) => `/admin/academic/classes/${id}/delete`,
  },

  ADMIN_ROOMS: {
    GET_LIST: "/admin/academic/rooms/get-list",
  },

  ADMIN_ENROLLMENTS: {
    CREATE: "/admin/academic/enrollments/insert",
  },

  ADMIN_PAYMENT_PLANS: {
    GET_LIST: "/admin/billing/payment-plans/get-list",
    GET_BY_ID: (id: string | number) => `/admin/billing/payment-plans/${id}/get-by-id`,
    CREATE: "/admin/billing/payment-plans/insert",
    UPDATE: (id: string | number) => `/admin/billing/payment-plans/${id}/update`,
    DELETE: (id: string | number) => `/admin/billing/payment-plans/${id}/delete`,
  },

  ADMIN_BILLING_POLICIES: {
    GET_LIST: "/admin/billing/policies/get-list",
    GET_BY_ID: (id: string | number) => `/admin/billing/policies/${id}/get-by-id`,
    CREATE: "/admin/billing/policies/insert",
    UPDATE: (id: string | number) => `/admin/billing/policies/${id}/update`,
    DELETE: (id: string | number) => `/admin/billing/policies/${id}/delete`,
  },

  ADMIN_ACCOUNT: {
    GET_STUDENT_ACCOUNT: "/admin/account/get-student-account",
    GET_TEACHER_ACCOUNT: "/admin/account/get-teacher-account",
  },

  ADMIN_METADATA: {
    STATUS: "/admin/metadata/status",
    GENDER: "/admin/metadata/gender-status",
    TEACHER_STATUS: "/admin/metadata/get-teacher-status",
    CONTRACT_TYPE: "/admin/metadata/get-contract-type",
    SALARY_TYPE: "/admin/metadata/get-salary-type",
    ROLE: "/admin/metadata/role-dropdown",
  },
};
