import axios, { isAxiosError } from "axios";

import { ENDPOINTS } from "./endpoint";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthRedirect?: boolean;
  }
}

const USER_STORAGE_KEY = "englishcentral-user";
const ACCESS_TOKEN_STORAGE_KEY = "englishcentral-access-token";
const ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY =
  "englishcentral-access-token-expires-at";
const ADMIN_USER_STORAGE_KEY = "englishcentral-admin-user";
const ADMIN_ACCESS_TOKEN_STORAGE_KEY = "englishcentral-admin-access-token";
const ADMIN_ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY =
  "englishcentral-admin-access-token-expires-at";
const AUTH_CHANGE_EVENT = "englishcentral-auth-change";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

type RetryableRequestConfig = NonNullable<
  Parameters<typeof api.request>[0]
> & {
  _retry?: boolean;
};

type RawObject = Record<string, unknown>;
type AuthContext = "public" | "admin";
type AuthStorageKeys = {
  user: string;
  accessToken: string;
  accessTokenExpiresAt: string;
};

const PUBLIC_AUTH_KEYS: AuthStorageKeys = {
  user: USER_STORAGE_KEY,
  accessToken: ACCESS_TOKEN_STORAGE_KEY,
  accessTokenExpiresAt: ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY,
};

const ADMIN_AUTH_KEYS: AuthStorageKeys = {
  user: ADMIN_USER_STORAGE_KEY,
  accessToken: ADMIN_ACCESS_TOKEN_STORAGE_KEY,
  accessTokenExpiresAt: ADMIN_ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY,
};

const getAuthKeys = (context: AuthContext) =>
  context === "admin" ? ADMIN_AUTH_KEYS : PUBLIC_AUTH_KEYS;

const getAuthContext = (url?: string): AuthContext => {
  if (url?.includes("/admin/") || window.location.pathname.startsWith("/admin")) {
    return "admin";
  }

  return "public";
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

const getSessionStorageTarget = (context: AuthContext) => {
  const keys = getAuthKeys(context);

  return window.localStorage.getItem(keys.accessToken) ||
    window.localStorage.getItem(keys.user)
    ? window.localStorage
    : window.sessionStorage;
};

const clearAuthStorage = (context?: AuthContext) => {
  const contexts: AuthContext[] = context ? [context] : ["public", "admin"];

  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const authContext of contexts) {
      const keys = getAuthKeys(authContext);

      storage.removeItem(keys.user);
      storage.removeItem(keys.accessToken);
      storage.removeItem(keys.accessTokenExpiresAt);
    }
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

const getStoredUser = (context: AuthContext) => {
  const keys = getAuthKeys(context);
  const rawUser =
    window.localStorage.getItem(keys.user) ??
    window.sessionStorage.getItem(keys.user);

  if (!rawUser) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(rawUser);

    return isObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const normalizeRefreshSession = (data: unknown, context: AuthContext) => {
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
  const storedUser = getStoredUser(context);
  const user = {
    ...storedUser,
    id:
      readString(nestedData, ["publicId", "PublicId", "id", "userId"]) ??
      readString(storedUser, ["id", "userId", "publicId", "PublicId"]),
    name:
      readString(nestedData, ["fullName", "FullName", "name"]) ??
      readString(storedUser, ["name", "fullName", "FullName"]),
    email:
      readString(nestedData, ["email", "Email"]) ??
      readString(storedUser, ["email", "Email"]) ??
      "",
  };

  return {
    accessToken,
    accessTokenExpiresAt,
    user,
  };
};

const saveRefreshedSession = (data: unknown, context: AuthContext) => {
  const session = normalizeRefreshSession(data, context);

  if (!session.accessToken) {
    throw new Error("Refresh response does not include an access token.");
  }

  const storage = getSessionStorageTarget(context);
  const keys = getAuthKeys(context);

  storage.setItem(keys.user, JSON.stringify(session.user));
  storage.setItem(keys.accessToken, session.accessToken);

  if (session.accessTokenExpiresAt) {
    storage.setItem(keys.accessTokenExpiresAt, session.accessTokenExpiresAt);
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));

  return session.accessToken;
};

const refreshPromises: Record<AuthContext, Promise<string> | null> = {
  public: null,
  admin: null,
};

const refreshAccessToken = (context: AuthContext) => {
  const refreshEndpoint =
    context === "admin" ? ENDPOINTS.ADMIN_AUTH.REFRESH : ENDPOINTS.AUTH.REFRESH;

  refreshPromises[context] ??= refreshApi
    .post(refreshEndpoint)
    .then((response) => saveRefreshedSession(response.data, context))
    .finally(() => {
      refreshPromises[context] = null;
    });

  return refreshPromises[context];
};

const redirectToLogin = () => {
  const loginPath = window.location.pathname.startsWith("/admin")
    ? "/admin/login"
    : "/login";

  if (window.location.pathname !== loginPath) {
    window.location.assign(loginPath);
  }
};

api.interceptors.request.use((config) => {
  const context = getAuthContext(config.url);
  const keys = getAuthKeys(context);
  const accessToken =
    window.localStorage.getItem(keys.accessToken) ??
    window.sessionStorage.getItem(keys.accessToken);

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (originalRequest?.skipAuthRedirect) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest?.url ?? "";
    const authContext = getAuthContext(requestUrl);
    const isAuthRequest =
      requestUrl.includes(ENDPOINTS.AUTH.LOGIN) ||
      requestUrl.includes(ENDPOINTS.AUTH.LOGOUT) ||
      requestUrl.includes(ENDPOINTS.AUTH.REFRESH) ||
      requestUrl.includes(ENDPOINTS.ADMIN_AUTH.REFRESH);

    if (!originalRequest || originalRequest._retry || isAuthRequest) {
      clearAuthStorage(authContext);
      redirectToLogin();

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken(authContext);
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return api.request(originalRequest);
    } catch (refreshError) {
      clearAuthStorage(authContext);
      redirectToLogin();

      return Promise.reject(refreshError);
    }
  }
);
