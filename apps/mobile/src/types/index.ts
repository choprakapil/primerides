export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: any;
}

export interface CustomerUser {
  id: number;
  fullName: string;
  phone: string;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface Location {
  id: number;
  city: string;
  name: string;
  slug: string;
  address?: string | null;
  is_active: boolean;
}

export interface RentalPlan {
  id: number;
  name: string;
  plan_type: "km_package" | "monthly";
  free_km: number;
  price: number | string;
  security_deposit: number | string;
  extra_km_rate: number | string;
  duration_days: number;
  is_active: boolean;
}

export interface Car {
  id: number;
  name: string;
  slug: string;
  brand: string;
  location_id?: number | null;
  location?: Location | null;
  category_id: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  price_per_day: number | string;
  security_deposit?: number | string | null;
  transmission: string;
  seats: number;
  doors: number;
  fuel_type: string;
  engine_hp?: number | null;
  primary_image: string;
  gallery_images?: string[] | null;
  badge?: string | null;
  description?: string | null;
  features?: string[] | null;
  is_available: boolean;
  is_featured: boolean;
  rental_plans?: RentalPlan[];
}

export interface Booking {
  id: number;
  booking_code: string;
  customer_id?: number;
  full_name: string;
  phone: string;
  email?: string | null;
  location_id?: number | null;
  location?: Location | null;
  car_id?: number;
  car_name?: string;
  car?: Car;
  rental_plan_id?: number | null;
  rental_plan?: RentalPlan | null;
  start_date: string;
  end_date: string;
  pickup_location?: string;
  drop_location?: string;
  with_chauffeur: boolean;
  base_amount?: number | string;
  chauffeur_fee?: number | string;
  security_deposit?: number | string;
  total_amount?: number | string;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  created_at: string;
}

export interface IdentityDocument {
  id: number;
  customer_id: number;
  type: string;
  file_name?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  status: "pending" | "verified" | "rejected";
  rejection_reason?: string | null;
  verified_at?: string | null;
  created_at: string;
  viewUrl?: string;
}

export interface PaymentRecord {
  id: number;
  booking_id: number;
  amount: number | string;
  currency: string;
  gateway: string;
  transaction_ref?: string | null;
  gateway_payment_id?: string | null;
  payment_method?: string | null;
  status: "pending" | "authorized" | "captured" | "failed" | "refunded";
  created_at: string;
  booking?: {
    id: number;
    booking_code: string;
    car_name?: string | null;
    start_date: string;
    end_date: string;
    car?: {
      name: string;
      brand?: string | null;
      primary_image?: string;
    } | null;
    rental_plan?: {
      name: string;
    } | null;
  } | null;
}

export interface UnpaidBookingRecord {
  id: number;
  booking_code: string;
  car_name?: string | null;
  car?: {
    name: string;
    brand?: string | null;
    primary_image?: string;
  } | null;
  rental_plan?: {
    name: string;
    free_km?: number;
  } | null;
  price_snapshot?: {
    plan_name?: string;
    security_deposit?: number;
  } | null;
  start_date: string;
  end_date: string;
  total_amount: number | string;
  status: string;
  totalPaid: number;
  isPaid: boolean;
  notes?: string | null;
}

export interface PaymentLedgerData {
  payments: PaymentRecord[];
  unpaidBookings: UnpaidBookingRecord[];
  stats: {
    totalCaptured: number;
    totalAuthorized: number;
    totalRefunded: number;
    totalTransactions: number;
    totalTrips: number;
    activeBookings: number;
    hasVerifiedDL: boolean;
  };
}

