import { isAxiosError } from "axios";
import { api } from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoint";

export type AuthUser = {
  id?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  level?: string;
  roles?: string[];
  permissions?: string[];
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

export type AuthSession = {
  accessToken?: string;
  accessTokenExpiresAt?: string;
  user: AuthUser;
};

type RawObject = Record<string, unknown>;

const USER_STORAGE_KEY = "englishcentral-user";
const ACCESS_TOKEN_STORAGE_KEY = "englishcentral-access-token";
const ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY =
  "englishcentral-access-token-expires-at";
const ADMIN_USER_STORAGE_KEY = "englishcentral-admin-user";
const ADMIN_ACCESS_TOKEN_STORAGE_KEY = "englishcentral-admin-access-token";
const ADMIN_ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY =
  "englishcentral-admin-access-token-expires-at";
export const AUTH_CHANGE_EVENT = "englishcentral-auth-change";
const AUTH_SYNC_CHANNEL = "englishcentral-auth-sync";

const removeAuthSessionFromStorage = (storage: Storage) => {
  storage.removeItem(USER_STORAGE_KEY);
  storage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  storage.removeItem(ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY);
};

const removeAdminAuthSessionFromStorage = (storage: Storage) => {
  storage.removeItem(ADMIN_USER_STORAGE_KEY);
  storage.removeItem(ADMIN_ACCESS_TOKEN_STORAGE_KEY);
  storage.removeItem(ADMIN_ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY);
};

const isObject = (value: unknown): value is RawObject =>
  typeof value === "object" && value !== null;

const readString = (source: RawObject, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];

    if (
      (typeof value === "string" && value.trim()) ||
      typeof value === "number"
    ) {
      return String(value);
    }
  }

  return undefined;
};

const readStringArray = (source: RawObject, keys: string[]) => {
  const values: string[] = [];

  for (const key of keys) {
    const value = source[key];

    if (Array.isArray(value)) {
      values.push(
        ...value
          .filter((item): item is string | number =>
            typeof item === "string" || typeof item === "number"
          )
          .map(String)
      );
      continue;
    }

    if (
      (typeof value === "string" && value.trim()) ||
      typeof value === "number"
    ) {
      values.push(String(value));
    }
  }

  return Array.from(new Set(values));
};

const readValidationErrorMessages = (value: unknown) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string | number => typeof item === "string" || typeof item === "number")
      .map(String)
      .filter((item) => item.trim());
  }

  if (!isObject(value)) {
    return [];
  }

  return Object.values(value)
    .flatMap((entry) => {
      if (Array.isArray(entry)) {
        return entry;
      }

      return typeof entry === "string" || typeof entry === "number" ? [entry] : [];
    })
    .filter((item): item is string | number => typeof item === "string" || typeof item === "number")
    .map(String)
    .filter((item) => item.trim());
};

const decodeJwtPayload = (token?: string): RawObject | null => {
  if (!token) {
    return null;
  }

  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = window.atob(normalizedPayload);
    const parsed: unknown = JSON.parse(json);

    return isObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const roleClaimKeys = [
  "role",
  "roles",
  "Role",
  "Roles",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
];

const permissionClaimKeys = [
  "permission",
  "permissions",
  "Permission",
  "Permissions",
];

export const ADMIN_PORTAL_ROLES = [
  "Admin",
  "BranchManager",
  "Teacher",
  "HR",
  "Accountant",
];

const findUserSource = (data: unknown): RawObject => {
  if (!isObject(data)) {
    return {};
  }

  const nestedUser = data.user ?? data.data ?? data.account ?? data.profile;

  return isObject(nestedUser) ? nestedUser : data;
};

const normalizeUser = (data: unknown, accessToken?: string): AuthUser => {
  const userSource = findUserSource(data);
  const jwtPayload = decodeJwtPayload(accessToken);
  const studentSource = isObject(userSource.student) ? userSource.student : {};
  const source = { ...(jwtPayload ?? {}), ...studentSource, ...userSource };
  const name =
    readString(source, [
      "name",
      "fullName",
      "FullName",
      "displayName",
      "userName",
      "unique_name",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
    ]) ?? "Học viên";

  return {
    id: readString(source, [
      "id",
      "userId",
      "publicId",
      "PublicId",
      "sub",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    ]),
    name,
    email:
      readString(source, [
        "email",
        "Email",
        "emailAddress",
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
      ]) ?? "",
    phoneNumber: readString(source, ["phoneNumber", "PhoneNumber", "phone", "tel"]),
    gender: readString(source, ["gender", "Gender", "sex"]),
    dateOfBirth: readString(source, ["dateOfBirth", "DateOfBirth", "birthDate", "dob"]),
    level: readString(source, ["level"]) ?? "IELTS",
    roles: readStringArray(source, roleClaimKeys),
    permissions: readStringArray(source, permissionClaimKeys),
  };
};

const normalizeSession = (data: unknown): AuthSession => {
  const source = isObject(data) ? data : {};
  const nestedData = isObject(source.data) ? source.data : source;
  const accessToken = readString(nestedData, [
    "accessToken",
    "AccessToken",
    "token",
    "jwt",
    "jwtToken",
  ]);
  const accessTokenExpiresAt = readString(nestedData, [
    "accessTokenExpiresAt",
    "AccessTokenExpiresAt",
  ]);

  return {
    accessToken,
    accessTokenExpiresAt,
    user: normalizeUser(nestedData, accessToken),
  };
};

export const getAuthErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data;

    if (isObject(data)) {
      const validationMessages = readValidationErrorMessages(data.errors);

      if (validationMessages.length > 0) {
        return validationMessages.join(", ");
      }

      const message =
        readString(data, ["message", "error", "title", "detail"]) ??
        validationMessages.join(", ");

      if (message) {
        return message;
      }
    }

    if (typeof data === "string" && data.trim()) {
      return data;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Không thể kết nối tới server";
};

export const saveAuthSession = (
  session: AuthSession,
  _rememberLogin?: boolean
) => {
  removeAuthSessionFromStorage(window.sessionStorage);
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));

  if (session.accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, session.accessToken);
  }

  if (session.accessTokenExpiresAt) {
    window.localStorage.setItem(
      ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY,
      session.accessTokenExpiresAt
    );
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const saveAdminAuthSession = (
  session: AuthSession,
  _rememberLogin?: boolean
) => {
  removeAdminAuthSessionFromStorage(window.sessionStorage);
  window.localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(session.user));

  if (session.accessToken) {
    window.localStorage.setItem(ADMIN_ACCESS_TOKEN_STORAGE_KEY, session.accessToken);
  }

  if (session.accessTokenExpiresAt) {
    window.localStorage.setItem(
      ADMIN_ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY,
      session.accessTokenExpiresAt
    );
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const clearAuthSession = () => {
  removeAuthSessionFromStorage(window.localStorage);
  removeAuthSessionFromStorage(window.sessionStorage);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const clearAdminAuthSession = () => {
  removeAdminAuthSessionFromStorage(window.localStorage);
  removeAdminAuthSessionFromStorage(window.sessionStorage);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const getStoredUser = (): AuthUser | null => {
  const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
};

export const getStoredAccessToken = () =>
  window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

export const getStoredAdminUser = (): AuthUser | null => {
  const rawUser = window.localStorage.getItem(ADMIN_USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
};

export const getStoredAdminAccessToken = () =>
  window.localStorage.getItem(ADMIN_ACCESS_TOKEN_STORAGE_KEY);

const getStudentIdFromAccessToken = (accessToken?: string) => {
  const tokenPayload = decodeJwtPayload(accessToken) ?? {};
  const rawStudentId = readString(tokenPayload, [
    "studentId",
    "StudentId",
    "student_id",
    "StudentID",
  ]);

  if (!rawStudentId) {
    return null;
  }

  const studentId = Number(rawStudentId);
  return Number.isFinite(studentId) ? studentId : null;
};

export const getStoredStudentIdFromAccessToken = () =>
  getStudentIdFromAccessToken(getStoredAccessToken() ?? undefined);

export const refreshStoredAuthSession = async () => {
  const response = await api.post(ENDPOINTS.AUTH.REFRESH, undefined, {
    withCredentials: true,
  });
  const session = normalizeSession(response.data);

  saveAuthSession(session);

  return session;
};

export const getStudentIdWithRefresh = async () => {
  const storedStudentId = getStoredStudentIdFromAccessToken();

  if (storedStudentId !== null) {
    return storedStudentId;
  }

  const session = await refreshStoredAuthSession();
  return getStudentIdFromAccessToken(session.accessToken);
};

export const getStoredAuthSession = (): AuthSession | null => {
  const user = getStoredUser();
  const accessToken = getStoredAccessToken();
  const accessTokenExpiresAt =
    window.localStorage.getItem(ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY) ??
    undefined;

  if (!user || !accessToken) {
    return null;
  }

  return {
    accessToken,
    accessTokenExpiresAt,
    user,
  };
};

export const getStoredAdminAuthSession = (): AuthSession | null => {
  const user = getStoredAdminUser();
  const accessToken = getStoredAdminAccessToken();
  const accessTokenExpiresAt =
    window.localStorage.getItem(ADMIN_ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY) ??
    undefined;

  if (!user || !accessToken) {
    return null;
  }

  return {
    accessToken,
    accessTokenExpiresAt,
    user,
  };
};

export const refreshStoredAdminAuthSession = async () => {
  const response = await api.post(ENDPOINTS.ADMIN_AUTH.REFRESH, undefined, {
    withCredentials: true,
  });
  const session = normalizeSession(response.data);

  saveAdminAuthSession(session);

  return session;
};

export const hasAdminPortalAccess = (
  session = getStoredAdminAuthSession()
) => {
  if (!session?.accessToken) {
    return false;
  }

  const tokenPayload = decodeJwtPayload(session.accessToken) ?? {};
  const roles = new Set([
    ...(session.user.roles ?? []),
    ...readStringArray(tokenPayload, roleClaimKeys),
  ]);
  const permissions = [
    ...(session.user.permissions ?? []),
    ...readStringArray(tokenPayload, permissionClaimKeys),
  ];

  return (
    ADMIN_PORTAL_ROLES.some((role) => roles.has(role)) ||
    permissions.length > 0
  );
};

type AuthSyncMessage =
  | { type: "request"; requestId: string }
  | { type: "response"; requestId: string; session: AuthSession };

const authSyncChannel =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel(AUTH_SYNC_CHANNEL)
    : null;

authSyncChannel?.addEventListener("message", (event: MessageEvent<AuthSyncMessage>) => {
  if (event.data.type !== "request") {
    return;
  }

  const session = getStoredAuthSession();

  if (session) {
    authSyncChannel.postMessage({
      type: "response",
      requestId: event.data.requestId,
      session,
    } satisfies AuthSyncMessage);
  }
});

export const syncAuthSessionFromOpenTab = () =>
  new Promise<boolean>((resolve) => {
    if (!authSyncChannel || getStoredAuthSession()) {
      resolve(Boolean(getStoredAuthSession()));
      return;
    }

    const requestId = window.crypto.randomUUID();
    const timeoutId = window.setTimeout(() => {
      authSyncChannel.removeEventListener("message", handleMessage);
      resolve(false);
    }, 400);

    const handleMessage = (event: MessageEvent<AuthSyncMessage>) => {
      if (event.data.type !== "response" || event.data.requestId !== requestId) {
        return;
      }

      window.clearTimeout(timeoutId);
      authSyncChannel.removeEventListener("message", handleMessage);
      saveAuthSession(event.data.session, false);
      resolve(true);
    };

    authSyncChannel.addEventListener("message", handleMessage);
    authSyncChannel.postMessage({ type: "request", requestId } satisfies AuthSyncMessage);
  });

export const authApi = {
  async login(payload: LoginPayload) {
    const response = await api.post(ENDPOINTS.AUTH.LOGIN, payload, {
      withCredentials: true,
    });
    return normalizeSession(response.data);
  },

  async adminLogin(payload: LoginPayload) {
    const response = await api.post(ENDPOINTS.ADMIN_AUTH.LOGIN, payload, {
      withCredentials: true,
    });
    return normalizeSession(response.data);
  },

  async register(payload: RegisterPayload) {
    const response = await api.post(ENDPOINTS.AUTH.REGISTER, payload, {
      withCredentials: true,
    });
    return normalizeSession(response.data);
  },

  async logout() {
    await api.post(ENDPOINTS.AUTH.LOGOUT, undefined, {
      withCredentials: true,
    });
  },

  async adminLogout() {
    await api.post(ENDPOINTS.ADMIN_AUTH.LOGOUT, undefined, {
      withCredentials: true,
    });
  },

  async refresh() {
    const response = await api.post(ENDPOINTS.AUTH.REFRESH, undefined, {
      withCredentials: true,
    });

    return normalizeSession(response.data);
  },

  async getProfile() {
    const response = await api.get(ENDPOINTS.AUTH.ME);
    const storedUser = getStoredUser();

    return {
      ...normalizeUser(response.data),
      id: storedUser?.id ?? normalizeUser(response.data).id,
    };
  },
};
