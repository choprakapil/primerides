export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MobileAuthResponse {
  token: string;
  customer: {
    id: number;
    fullName: string;
    phone: string;
    email?: string | null;
    avatarUrl?: string | null;
  };
}
