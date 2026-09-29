import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { ApiResponse, AuthTokens, Booking, Car, CustomerUser, IdentityDocument, Location, PaymentLedgerData } from "../types";

// Auto-detect local backend IP depending on platform
const DEFAULT_HOST = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_HOST;

const REFRESH_TOKEN_KEY = "primerides_mobile_refresh_token";

// In-memory access token storage
let inMemoryAccessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export async function saveRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function getStoredRefreshToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearTokens(): Promise<void> {
  inMemoryAccessToken = null;
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => {});
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

/**
 * Core HTTP Request Wrapper matching PrimeRides API Envelope.
 * Automatically performs silent refresh on 401 Unauthorized before failing.
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (inMemoryAccessToken) {
    headers["Authorization"] = `Bearer ${inMemoryAccessToken}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401: Attempt silent refresh once
    if (res.status === 401 && retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        const storedRefreshToken = await getStoredRefreshToken();

        if (storedRefreshToken) {
          try {
            const refreshRes = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken: storedRefreshToken }),
            });

            const refreshJson: ApiResponse<AuthTokens> = await refreshRes.json();
            if (refreshRes.ok && refreshJson.success && refreshJson.data) {
              const newAccessToken = refreshJson.data.accessToken;
              const newRefreshToken = refreshJson.data.refreshToken;

              setAccessToken(newAccessToken);
              if (newRefreshToken) {
                await saveRefreshToken(newRefreshToken);
              }

              isRefreshing = false;
              onRefreshed(newAccessToken);

              // Retry original request with new access token
              headers["Authorization"] = `Bearer ${newAccessToken}`;
              const retryRes = await fetch(url, { ...options, headers });
              return await retryRes.json();
            }
          } catch (refreshErr) {
            console.warn("Silent token refresh failed:", refreshErr);
          }
        }

        // Refresh failed: clear session
        isRefreshing = false;
        await clearTokens();
      } else {
        // Wait for active refresh to complete
        return new Promise((resolve) => {
          refreshSubscribers.push(async (newToken) => {
            headers["Authorization"] = `Bearer ${newToken}`;
            const retryRes = await fetch(url, { ...options, headers });
            resolve(await retryRes.json());
          });
        });
      }
    }

    const json: ApiResponse<T> = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network request failed. Please check your connection.",
    };
  }
}

// Typed PrimeRides API Client
export const api = {
  auth: {
    async register(data: { fullName: string; phone: string; password: string; email?: string }) {
      const res = await apiRequest<any>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }, false);

      return res;
    },

    async login(data: { identifier: string; password: string }) {
      const res = await apiRequest<{
        accessToken: string;
        refreshToken: string;
        customer: CustomerUser;
      }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }, false);

      if (res.success && res.data) {
        setAccessToken(res.data.accessToken);
        await saveRefreshToken(res.data.refreshToken);
      }

      return res;
    },

    async me() {
      return await apiRequest<CustomerUser>("/api/v1/auth/me");
    },

    async logout() {
      const storedRefreshToken = await getStoredRefreshToken();
      if (storedRefreshToken) {
        await apiRequest("/api/v1/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        }).catch(() => {});
      }
      await clearTokens();
    },
  },

  locations: {
    async getLocations() {
      return await apiRequest<Location[]>("/api/v1/locations");
    },
  },

  fleet: {
    async getCars(params?: { categoryId?: number; featuredOnly?: boolean; search?: string; location_id?: number }) {
      let qs = "";
      if (params) {
        const query = new URLSearchParams();
        if (params.categoryId) query.append("categoryId", String(params.categoryId));
        if (params.featuredOnly) query.append("featured", "true");
        if (params.search) query.append("search", params.search);
        if (params.location_id) query.append("location_id", String(params.location_id));
        qs = `?${query.toString()}`;
      }
      return await apiRequest<Car[]>(`/api/v1/cars${qs}`);
    },

    async getCarBySlug(slug: string) {
      return await apiRequest<Car>(`/api/v1/cars/${slug}`);
    },
  },

  bookings: {
    async getMyBookings() {
      return await apiRequest<Booking[]>("/api/v1/bookings");
    },

    async createBooking(data: {
      carId: number;
      rentalPlanId?: number;
      locationId?: number;
      startDate: string;
      endDate: string;
      pickupLocation?: string;
      dropLocation?: string;
      withChauffeur?: boolean;
    }) {
      return await apiRequest<Booking>("/api/v1/bookings", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },

  documents: {
    async getMyDocuments() {
      return await apiRequest<IdentityDocument[]>("/api/v1/customer/documents");
    },

    async uploadDocument(data: { type: string; fileBase64: string; fileName?: string; mimeType?: string }) {
      return await apiRequest<IdentityDocument>("/api/v1/customer/documents", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },

  payments: {
    async getMyPayments() {
      return await apiRequest<PaymentLedgerData>("/api/v1/customer/payments");
    },

    async submitPayment(data: {
      bookingId: number;
      paymentMethod: string;
      transactionRef?: string;
      amount?: number;
      notes?: string;
    }) {
      return await apiRequest("/api/v1/customer/payments", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },
};

