
import { Room, Customer, Booking, Payment, RoomType, RoomStatus, BookingStatus, DashboardStats, User, Role } from '../types';

/**
 * MOCK DATABASE STORAGE & SUPABASE SIMULATION
 * 
 * To use real Supabase:
 * 1. Install @supabase/supabase-js
 * 2. Create client: const supabase = createClient(URL, KEY)
 * 3. Replace the mock functions with the commented queries.
 */
const MOCK_DELAY = 500;

// --- MOCK DATA ---
let rooms: Room[] = [
  { room_id: '101', room_number: '101', room_type: RoomType.SINGLE, price_per_night: 100, status: RoomStatus.AVAILABLE },
  { room_id: '102', room_number: '102', room_type: RoomType.DOUBLE, price_per_night: 150, status: RoomStatus.AVAILABLE },
  { room_id: '201', room_number: '201', room_type: RoomType.SUITE, price_per_night: 300, status: RoomStatus.MAINTENANCE },
  { room_id: '305', room_number: '305', room_type: RoomType.DELUXE, price_per_night: 200, status: RoomStatus.AVAILABLE },
];

let customers: Customer[] = [
  { customer_id: 'c1', user_id: 'u_customer', full_name: 'John Doe', email: 'john@example.com', phone: '555-0101' },
];

let bookings: Booking[] = [
  { 
    booking_id: 'b1', 
    customer_id: 'c1', 
    room_id: '101', 
    check_in: new Date(Date.now() - 86400000 * 2).toISOString(), 
    check_out: new Date(Date.now() + 86400000).toISOString(), 
    total_amount: 300, 
    booking_status: BookingStatus.CHECKED_IN 
  }
];

let payments: Payment[] = [
  { payment_id: 'p1', booking_id: 'b1', amount_paid: 100, payment_date: new Date().toISOString(), payment_method: 'Credit Card' }
];

// Mock Auth Users
const users: User[] = [
  { id: 'u_admin', email: 'admin@hotel.com', role: 'admin' },
  { id: 'u_customer', email: 'john@example.com', role: 'customer', customer_id: 'c1' }
];

const delay = () => new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

export const api = {
  // --- AUTHENTICATION ---
  
  signIn: async (email: string, password: string): Promise<User> => {
    await delay();
    // SUPABASE: const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    // Mock Logic: Check if email contains 'admin' for admin role
    const user = users.find(u => u.email === email);
    if (user) return user;
    
    // For demo purposes, create on the fly if not exists (simulate signup if we wanted, but let's stick to strict login)
    if (email.includes('admin')) {
      return { id: 'new_admin', email, role: 'admin' };
    }
    throw new Error('User not found. Please sign up.');
  },

  signUp: async (email: string, password: string, fullName: string, phone: string): Promise<User> => {
    await delay();
    // SUPABASE: 
    // 1. const { data: auth } = await supabase.auth.signUp({ email, password });
    // 2. await supabase.from('customers').insert({ user_id: auth.user.id, full_name: fullName, phone });
    
    const newUserId = Math.random().toString(36).substr(2, 9);
    const newCustomerId = Math.random().toString(36).substr(2, 9);
    
    const newUser: User = { 
      id: newUserId, 
      email, 
      role: 'customer', 
      customer_id: newCustomerId 
    };
    
    users.push(newUser);
    customers.push({
      customer_id: newCustomerId,
      user_id: newUserId,
      full_name: fullName,
      email,
      phone
    });
    
    return newUser;
  },

  getCurrentCustomer: async (userId: string): Promise<Customer | undefined> => {
    await delay();
    // SUPABASE: const { data } = await supabase.from('customers').select('*').eq('user_id', userId).single();
    return customers.find(c => c.user_id === userId);
  },

  // --- ROOMS ---
  
  getRooms: async (): Promise<Room[]> => {
    await delay();
    // SUPABASE: const { data } = await supabase.from('rooms').select('*');
    return [...rooms];
  },

  addRoom: async (room: Omit<Room, 'room_id'>): Promise<Room> => {
    await delay();
    // SUPABASE: const { data } = await supabase.from('rooms').insert(room).select();
    const newRoom = { ...room, room_id: Math.random().toString(36).substr(2, 9) };
    rooms.push(newRoom);
    return newRoom;
  },

  updateRoomStatus: async (id: string, status: RoomStatus): Promise<void> => {
    await delay();
    // SUPABASE: await supabase.from('rooms').update({ status }).eq('room_id', id);
    rooms = rooms.map(r => r.room_id === id ? { ...r, status } : r);
  },

  deleteRoom: async (id: string): Promise<void> => {
    await delay();
    // SUPABASE: await supabase.from('rooms').delete().eq('room_id', id);
    rooms = rooms.filter(r => r.room_id !== id);
  },

  // --- CUSTOMERS ---
  
  getCustomers: async (): Promise<Customer[]> => {
    await delay();
    // SUPABASE: const { data } = await supabase.from('customers').select('*');
    return [...customers];
  },

  // --- BOOKINGS ---
  
  getBookings: async (customerId?: string): Promise<Booking[]> => {
    await delay();
    // SUPABASE: 
    // let query = supabase.from('bookings').select('*, rooms(*), customers(*)');
    // if (customerId) query = query.eq('customer_id', customerId);
    
    let filtered = bookings;
    if (customerId) {
      filtered = bookings.filter(b => b.customer_id === customerId);
    }

    return filtered.map(b => ({
      ...b,
      customer: customers.find(c => c.customer_id === b.customer_id),
      room: rooms.find(r => r.room_id === b.room_id)
    }));
  },

  createBooking: async (booking: Omit<Booking, 'booking_id' | 'booking_status'>): Promise<Booking> => {
    await delay();
    
    // Validation
    const hasOverlap = bookings.some(b => 
      b.room_id === booking.room_id &&
      b.booking_status !== BookingStatus.CANCELLED &&
      (
        (new Date(booking.check_in) < new Date(b.check_out)) &&
        (new Date(booking.check_out) > new Date(b.check_in))
      )
    );

    if (hasOverlap) throw new Error("Room is not available for these dates.");

    const newBooking: Booking = {
      ...booking,
      booking_id: Math.random().toString(36).substr(2, 9),
      booking_status: BookingStatus.CONFIRMED
    };
    
    bookings.push(newBooking);
    
    // Auto-update room status
    // SUPABASE: await supabase.from('rooms').update({ status: 'occupied' }).eq('room_id', booking.room_id);
    await api.updateRoomStatus(booking.room_id, RoomStatus.OCCUPIED);
    
    return newBooking;
  },

  cancelBooking: async (id: string): Promise<void> => {
    await delay();
    // SUPABASE: await supabase.from('bookings').update({ booking_status: 'cancelled' }).eq('booking_id', id);
    
    const booking = bookings.find(b => b.booking_id === id);
    if (booking) {
      booking.booking_status = BookingStatus.CANCELLED;
      // Auto-release room
      await api.updateRoomStatus(booking.room_id, RoomStatus.AVAILABLE);
    }
  },

  // --- PAYMENTS ---
  
  getPayments: async (): Promise<Payment[]> => {
    await delay();
    // SUPABASE: const { data } = await supabase.from('payments').select('*');
    return [...payments];
  },

  addPayment: async (payment: Omit<Payment, 'payment_id'>): Promise<Payment> => {
    await delay();
    // SUPABASE: const { data } = await supabase.from('payments').insert(payment).select();
    const newPayment = { ...payment, payment_id: Math.random().toString(36).substr(2, 9) };
    payments.push(newPayment);
    return newPayment;
  },

  // --- DASHBOARD ---
  
  getDashboardStats: async (): Promise<DashboardStats> => {
    await delay();
    // SQL aggregation in Supabase or client-side calc
    const activeBookings = bookings.filter(b => 
      b.booking_status === BookingStatus.CONFIRMED || b.booking_status === BookingStatus.CHECKED_IN
    ).length;
    
    const totalRevenue = payments.reduce((acc, p) => acc + p.amount_paid, 0);

    return {
      totalRooms: rooms.length,
      availableRooms: rooms.filter(r => r.status === RoomStatus.AVAILABLE).length,
      activeBookings,
      totalRevenue
    };
  }
};
