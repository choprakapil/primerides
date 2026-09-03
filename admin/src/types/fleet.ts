export interface CarCategoryDTO {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  carCount?: number;
}

export interface CarDTO {
  id: number;
  name: string;
  slug: string;
  brand: string;
  categoryId: number;
  categoryName?: string;
  pricePerDay: number;
  pricePerHour?: number | null;
  securityDeposit?: number | null;
  transmission: string;
  seats: number;
  doors: number;
  fuelType: string;
  engineHp?: number | null;
  acceleration?: string | null;
  topSpeed?: number | null;
  primaryImage: string;
  galleryImages?: string[];
  badge?: string | null;
  description?: string | null;
  features?: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarInput {
  name: string;
  brand: string;
  categoryId: number;
  pricePerDay: number;
  pricePerHour?: number;
  securityDeposit?: number;
  transmission?: string;
  seats?: number;
  doors?: number;
  fuelType?: string;
  engineHp?: number;
  acceleration?: string;
  topSpeed?: number;
  primaryImage: string;
  galleryImages?: string[];
  badge?: string;
  description?: string;
  features?: string[];
  isAvailable?: boolean;
  isFeatured?: boolean;
}
