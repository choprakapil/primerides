import { Platform } from "react-native";
import { create } from "zustand";
import { CustomerUser } from "../types";
import { api, clearTokens, getStoredRefreshToken, setAccessToken } from "../services/api";

async function syncDevicePushToken() {
  try {
    const Notifications = await import("expo-notifications").catch(() => null);
    if (!Notifications) return;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return;

    const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
    if (tokenData?.data) {
      await api.devices.registerDeviceToken({
        deviceType: Platform.OS,
        fcmToken: tokenData.data,
      });
    }
  } catch (err) {
    // Non-blocking in simulator or unsupported environments
    console.log("Device token sync skipped:", err);
  }
}

interface AuthState {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (identifier: string, pass: string) => Promise<boolean>;
  register: (fullName: string, phone: string, pass: string, email?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  restoreSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  async login(identifier: string, pass: string) {
    set({ isLoading: true, error: null });
    const res = await api.auth.login({ identifier, password: pass });

    if (res.success && res.data) {
      set({
        user: res.data.customer,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      syncDevicePushToken().catch(() => {});
      return true;
    } else {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: res.error || "Invalid phone/email or password.",
      });
      return false;
    }
  },

  async register(fullName: string, phone: string, pass: string, email?: string) {
    set({ isLoading: true, error: null });
    const res = await api.auth.register({
      fullName,
      phone,
      password: pass,
      email: email || undefined,
    });

    if (res.success) {
      // Auto-login after successful registration
      return await get().login(phone, pass);
    } else {
      set({
        isLoading: false,
        error: res.error || (res.errors ? Object.values(res.errors).flat().join(", ") : "Registration failed"),
      });
      return false;
    }
  },

  async logout() {
    await api.auth.logout();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  async deleteAccount() {
    set({ isLoading: true });
    const res = await api.auth.deleteAccount();
    if (res.success) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return true;
    } else {
      set({
        isLoading: false,
        error: res.error || "Failed to delete account.",
      });
      return false;
    }
  },

  async restoreSession() {
    set({ isLoading: true });
    try {
      const refreshToken = await getStoredRefreshToken();
      if (!refreshToken) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return false;
      }

      // Profile call triggers automatic silent refresh if access token in memory is empty
      const res = await api.auth.me();
      if (res.success && res.data) {
        set({
          user: res.data,
          isAuthenticated: true,
          isLoading: false,
        });
        syncDevicePushToken().catch(() => {});
        return true;
      } else {
        await clearTokens();
        set({ user: null, isAuthenticated: false, isLoading: false });
        return false;
      }
    } catch {
      await clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }
  },
}));
