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

type AuthSession = {
  accessToken?: string;
  accessTokenExpiresAt?: string;
  user: AuthUser;
};

type RawObject = Record<string, unknown>;

const USER_STORAGE_KEY = "englishcentral-user";
const ACCESS_TOKEN_STORAGE_KEY = "englishcentral-access-token";
const ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY =
  "englishcentral-access-token-expires-at";
export const AUTH_CHANGE_EVENT = "englishcentral-auth-change";

const getStorage = (rememberLogin: boolean) =>
  rememberLogin ? window.localStorage : window.sessionStorage;

const removeAuthSessionFromStorage = (storage: Storage) => {
  storage.removeItem(USER_STORAGE_KEY);
  storage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  storage.removeItem(ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY);
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
      const message =
        readString(data, ["message", "error", "title", "detail"]) ??
        (Array.isArray(data.errors) ? data.errors.join(", ") : undefined);

      if (message) {
        return message;
      }
    }

    if (typeof data === "string" && data.trim()) {
      return data;
    }
  }

  return "Không thể kết nối tới server";
};

const hasStoredSession = (storage: Storage) =>
  Boolean(storage.getItem(USER_STORAGE_KEY) ?? storage.getItem(ACCESS_TOKEN_STORAGE_KEY));

const shouldRememberLogin = (rememberLogin?: boolean) => {
  if (typeof rememberLogin === "boolean") {
    return rememberLogin;
  }

  if (hasStoredSession(window.localStorage)) {
    return true;
  }

  if (hasStoredSession(window.sessionStorage)) {
    return false;
  }

  return true;
};

export const saveAuthSession = (
  session: AuthSession,
  rememberLogin?: boolean
) => {
  const shouldPersist = shouldRememberLogin(rememberLogin);
  const storage = getStorage(shouldPersist);
  const otherStorage = shouldPersist
    ? window.sessionStorage
    : window.localStorage;

  removeAuthSessionFromStorage(otherStorage);
  storage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));

  if (session.accessToken) {
    storage.setItem(ACCESS_TOKEN_STORAGE_KEY, session.accessToken);
  }

  if (session.accessTokenExpiresAt) {
    storage.setItem(
      ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY,
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

export const getStoredUser = (): AuthUser | null => {
  const rawUser =
    window.localStorage.getItem(USER_STORAGE_KEY) ??
    window.sessionStorage.getItem(USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
};

export const authApi = {
  async login(payload: LoginPayload) {
    const response = await api.post(ENDPOINTS.AUTH.LOGIN, payload, {
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
    const user = getStoredUser();

    if (!user?.id) {
      return;
    }

    await api.post(
      ENDPOINTS.AUTH.LOGOUT,
      {
        userPublicId: user.id,
      },
      {
        withCredentials: true,
      }
    );
  },

  async refresh() {
    const user = getStoredUser();
    const response = await api.post(
      ENDPOINTS.AUTH.REFRESH,
      {
        userPublicId: user?.id,
      },
      {
        withCredentials: true,
      }
    );

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
