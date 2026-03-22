/**
 * CASIPass — API Service Layer (Axios + JWT Interceptors)
 * ═══════════════════════════════════════════════════════════════
 * Instância base de requisição HTTP configurada para o back-end
 * Django REST Framework com autenticação JWT (SimpleJWT).
 *
 * - Injeta automaticamente o Bearer Token em todas as chamadas
 * - Intercepta respostas 401 para refresh automático do token
 * - Queue de requisições pendentes durante o refresh
 * - Fallback para mock data em modo demo (sem backend)
 *
 * CONFIGURAÇÃO:
 *   Altere API_BASE_URL para apontar ao seu servidor Django.
 *   Em produção: https://api.casipass.com.br/api
 * ═══════════════════════════════════════════════════════════════
 */
import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

// ── Config ──────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Flag que indica se estamos em modo demo (sem backend real).
 * Quando true, os serviços retornarão mock data ao invés de
 * fazer chamadas HTTP reais.
 */
export const IS_DEMO_MODE = !import.meta.env.VITE_API_BASE_URL;

// ── Token helpers (localStorage) ────────────────────────────
// TODO (V2): Implementar padrao BFF e migrar armazenamento de JWT
// do LocalStorage para HttpOnly Cookies visando mitigar riscos de XSS.
// Ref: https://owasp.org/www-community/HttpOnly
const TOKEN_KEY = 'casipass_access_token';
const REFRESH_KEY = 'casipass_refresh_token';

export const tokenStorage = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ── Axios instance ──────────────────────────────────────────
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request Interceptor: Inject Bearer Token ────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccess();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Auto-refresh on 401 ──────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401 and not already retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh the refresh endpoint itself
    if (originalRequest.url?.includes('/auth/refresh/')) {
      tokenStorage.clear();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the refresh completes
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) {
      tokenStorage.clear();
      isRefreshing = false;
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
        refresh: refreshToken,
      });

      const newAccess: string = data.access;
      const newRefresh: string = data.refresh || refreshToken;
      tokenStorage.setTokens(newAccess, newRefresh);

      processQueue(null, newAccess);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as AxiosError, null);
      tokenStorage.clear();
      // Optionally redirect to login
      window.dispatchEvent(new CustomEvent('casipass:session-expired'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ── Multipart helper for file uploads ───────────────────────
export const apiMultipart: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'multipart/form-data',
    Accept: 'application/json',
  },
});

// Same interceptors for multipart
apiMultipart.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccess();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// FIX: Response interceptor for multipart (auto-refresh on 401)
apiMultipart.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) {
      tokenStorage.clear();
      return Promise.reject(error);
    }
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh: refreshToken });
      tokenStorage.setTokens(data.access, data.refresh || refreshToken);
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
      }
      return apiMultipart(originalRequest);
    } catch (refreshError) {
      tokenStorage.clear();
      window.dispatchEvent(new CustomEvent('casipass:session-expired'));
      return Promise.reject(refreshError);
    }
  }
);

// ── CPF Validation (algorithmic check digit — validate-docbr compatible) ──
export function isValidCpfAlgorithm(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  // Reject known invalid sequences (all same digit)
  if (/^(\d)\1{10}$/.test(digits)) return false;
  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;
  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[10])) return false;
  return true;
}

export default api;