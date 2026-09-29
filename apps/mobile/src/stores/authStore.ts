import { create } from "zustand";
import { CustomerUser } from "../types";
import { api, clearTokens, getStoredRefreshToken, setAccessToken } from "../services/api";

interface AuthState {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (identifier: string, pass: string) => Promise<boolean>;
  register: (fullName: string, phone: string, pass: string, email?: string) => Promise<boolean>;
  logout: () => Promise<void>;
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
