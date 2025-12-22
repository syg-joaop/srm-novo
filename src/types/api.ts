/**
 * Tipos genéricos para comunicação com APIs.
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
  status: number;
  code: number;
}

export interface ApiErrorResponse {
  statusCode: number;
  statusMessage?: string;
  message: string;
  data?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface ApiListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: unknown;
}

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: ApiMethod;
  body?: unknown;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface ApiClient {
  get<T>(url: string, options?: ApiRequestOptions): Promise<T>;
  post<T>(url: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
  put<T>(url: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
  patch<T>(url: string, body?: unknown, options?: ApiRequestOptions): Promise<T>;
  delete<T>(url: string, options?: ApiRequestOptions): Promise<T>;
}
