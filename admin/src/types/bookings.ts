export interface BookingDTO {
  id: number;
  bookingCode: string;
  customerId?: number | null;
  fullName: string;
  phone: string;
  email?: string | null;
  carId?: number | null;
  carName?: string | null;
  carImage?: string | null;
  startDate: string;
  endDate: string;
  pickupLocation?: string | null;
  dropLocation?: string | null;
  withChauffeur: boolean;
  totalAmount?: number | null;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  source: 'web' | 'android' | 'ios' | 'rental_calculator' | 'hero_form';
  notes?: string | null;
  adminNotes?: string | null;
  createdAt: string;
}

export interface ContactLeadDTO {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  subject?: string | null;
  message: string;
  source: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  createdAt: string;
}
