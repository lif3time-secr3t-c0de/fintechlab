export interface ApiErrorResponse {
  error: string;
  message?: string;
  limit?: number;
  used?: number;
  resetAt?: string;
}
