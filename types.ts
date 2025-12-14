
export enum RoomType {
  SINGLE = 'Single',
  DOUBLE = 'Double',
  SUITE = 'Suite',
  DELUXE = 'Deluxe'
}

export enum RoomStatus {
  AVAILABLE = 'available',
  MAINTENANCE = 'maintenance',
  OCCUPIED = 'occupied'
}

export interface Room {
  room_id: string;
  room_number: string;
  room_type: RoomType;
  price_per_night: number;
  status: RoomStatus;
}

export interface Customer {
  customer_id: string;
  user_id: string; // Links to Auth User
  full_name: string;
  email: string;
  phone: string;
}

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled'
}

export interface Booking {
  booking_id: string;
  customer_id: string;
  room_id: string;
  check_in: string; // ISO Date string
  check_out: string; // ISO Date string
  total_amount: number;
  booking_status: BookingStatus;
  
  // Joins for UI convenience
  customer?: Customer;
  room?: Room;
}

export interface Payment {
  payment_id: string;
  booking_id: string;
  amount_paid: number;
  payment_date: string;
  payment_method: 'Credit Card' | 'Cash' | 'Transfer';
}

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  activeBookings: number;
  totalRevenue: number;
}

// --- AUTH TYPES ---

export type Role = 'admin' | 'customer';

export interface User {
  id: string;
  email: string;
  role: Role;
  customer_id?: string; // If role is customer, this links to public.customers
}
