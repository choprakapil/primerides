export interface RentalPlanItem {
  id: number;
  name: string;
  plan_type: string;
  free_km: number;
  price: number | string;
  security_deposit: number | string;
  extra_km_rate: number | string;
  duration_days: number;
}

export interface VehicleDetailData {
  id: number;
  name: string;
  slug: string;
  brand: string;
  price_per_day: number | string;
  security_deposit?: number | string | null;
  transmission: string;
  seats: number;
  doors?: number | null;
  fuel_type: string;
  engine_hp?: number | null;
  badge?: string | null;
  description?: string | null;
  features?: string[] | null;
  primary_image?: string | null;
  gallery_images?: string[] | null;
  is_available?: boolean;
  category?: {
    id?: number;
    name?: string;
    slug?: string;
  } | null;
  location?: {
    id: number;
    name: string;
    city: string;
    slug?: string;
    address?: string | null;
  } | null;
  rental_plans: RentalPlanItem[];
}

export function formatCarDisplayName(brand: string, name: string): string {
  if (!name) return "";
  const trimmed = name.trim();
  const doubleBrand = `${brand} ${brand}`;
  if (trimmed.toLowerCase().startsWith(doubleBrand.toLowerCase())) {
    return `${brand} ${trimmed.slice(doubleBrand.length).trim()}`;
  }
  return trimmed;
}

