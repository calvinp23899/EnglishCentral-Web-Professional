import axios, { isAxiosError } from "axios";

import { ENDPOINTS } from "./endpoint";

const USER_STORAGE_KEY = "englishcentral-user";
const ACCESS_TOKEN_STORAGE_KEY = "englishcentral-access-token";
const ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY =
  "englishcentral-access-token-expires-at";
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

const getSessionStorageTarget = () =>
  window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ||
  window.localStorage.getItem(USER_STORAGE_KEY)
    ? window.localStorage
    : window.sessionStorage;

const clearAuthStorage = () => {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    storage.removeItem(USER_STORAGE_KEY);
    storage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    storage.removeItem(ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY);
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

const getStoredUser = () => {
  const rawUser =
    window.localStorage.getItem(USER_STORAGE_KEY) ??
    window.sessionStorage.getItem(USER_STORAGE_KEY);

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

const normalizeRefreshSession = (data: unknown) => {
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
  const storedUser = getStoredUser();
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

const saveRefreshedSession = (data: unknown) => {
  const session = normalizeRefreshSession(data);

  if (!session.accessToken) {
    throw new Error("Refresh response does not include an access token.");
  }

  const storage = getSessionStorageTarget();

  storage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));
  storage.setItem(ACCESS_TOKEN_STORAGE_KEY, session.accessToken);

  if (session.accessTokenExpiresAt) {
    storage.setItem(
      ACCESS_TOKEN_EXPIRES_AT_STORAGE_KEY,
      session.accessTokenExpiresAt
    );
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));

  return session.accessToken;
};

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = () => {
  refreshPromise ??= refreshApi
    .post(ENDPOINTS.AUTH.REFRESH)
    .then((response) => saveRefreshedSession(response.data))
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
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
  const accessToken =
    window.localStorage.getItem("englishcentral-access-token") ??
    window.sessionStorage.getItem("englishcentral-access-token");

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
    const requestUrl = originalRequest?.url ?? "";
    const isAuthRequest =
      requestUrl.includes(ENDPOINTS.AUTH.LOGIN) ||
      requestUrl.includes(ENDPOINTS.AUTH.LOGOUT) ||
      requestUrl.includes(ENDPOINTS.AUTH.REFRESH);

    if (!originalRequest || originalRequest._retry || isAuthRequest) {
      clearAuthStorage();
      redirectToLogin();

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return api.request(originalRequest);
    } catch (refreshError) {
      clearAuthStorage();
      redirectToLogin();

      return Promise.reject(refreshError);
    }
  }
);
