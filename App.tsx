import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, BedDouble, Users, CalendarDays, CreditCard, 
  Plus, Trash2, CheckCircle, XCircle, LogOut, Lock, User as UserIcon, Share2, Check, AlertTriangle, ExternalLink
} from 'lucide-react';
import { api } from './services/api';
import { Room, Customer, Booking, Payment, RoomType, RoomStatus, BookingStatus, DashboardStats, User, Role } from './types';
import { format, differenceInCalendarDays } from 'date-fns';

// --- COMPONENTS ---

// 1. Share Dialog Component (New)
const ShareDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-amber-50 p-6 border-b border-amber-100 flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900">Private Preview Link</h3>
            <p className="text-sm text-amber-800 mt-1">
              You are currently running in a private development environment.
            </p>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="text-slate-600 text-sm space-y-3">
            <p>
              If you send this link to others, they will see a <strong className="text-slate-900">404 Not Found</strong> error because they don't have access to your secure session.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="font-semibold text-slate-800 mb-1">How to share publicly?</p>
              <p>To make this app accessible to others, you must <strong>deploy</strong> the code to a hosting provider like:</p>
              <ul className="list-disc list-inside mt-2 ml-1 text-slate-500">
                <li>Vercel</li>
                <li>Netlify</li>
                <li>GitHub Pages</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
          <button 
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 text-white transition-all ${copied ? 'bg-green-600' : 'bg-slate-900 hover:bg-slate-800'}`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard' : 'Copy Private Link Anyway'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Authentication Page
const AuthPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const user = await api.signIn(form.email, form.password);
        onLogin(user);
      } else {
        const user = await api.signUp(form.email, form.password, form.fullName, form.phone);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Hotel Admin</h1>
          <p className="text-slate-500 mt-2">Supabase Reservation System</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required className="w-full border rounded-lg p-2.5" 
                  value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input required className="w-full border rounded-lg p-2.5" 
                  value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input required type="email" className="w-full border rounded-lg p-2.5" 
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input required type="password" className="w-full border rounded-lg p-2.5" 
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>

          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline">
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t text-xs text-slate-400 text-center">
          <p>Try <strong>admin@hotel.com</strong> for Admin Access</p>
        </div>
      </div>
    </div>
  );
};

// 3. Sidebar with RBAC
const Sidebar = ({ activeTab, onTabChange, user, onLogout }: { activeTab: string, onTabChange: (tab: string) => void, user: User, onLogout: () => void }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  
  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rooms', label: 'Rooms Management', icon: BedDouble },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'bookings', label: 'All Bookings', icon: CalendarDays },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];

  const customerMenu = [
    { id: 'my-bookings', label: 'My Bookings', icon: CalendarDays },
    { id: 'book-room', label: 'Book a Room', icon: BedDouble },
  ];

  const menu = user.role === 'admin' ? adminMenu : customerMenu;

  return (
    <>
      <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">Hotel<span className="text-white">OS</span></h1>
          <p className="text-xs text-slate-500 mt-1 capitalize">{user.role} Portal</p>
        </div>
        
        <div className="p-4 bg-slate-800/50 mb-2 mx-2 rounded-lg flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-full">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user.email}</p>
            <p className="text-xs text-slate-400 capitalize">{user.role}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800 space-y-1">
          <button onClick={() => setShowShareModal(true)} className="flex items-center w-full px-4 py-3 text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors">
            <Share2 className="w-5 h-5 mr-3" />
            <span>Share Link</span>
          </button>
          <button onClick={onLogout} className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
      <ShareDialog isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </>
  );
};

// 4. Components
const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => { api.getDashboardStats().then(setStats); }, []);

  if (!stats) return <div className="p-8">Loading stats...</div>;

  const cards = [
    { label: 'Total Rooms', value: stats.totalRooms, icon: BedDouble, color: 'bg-blue-500' },
    { label: 'Available', value: stats.availableRooms, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Active Bookings', value: stats.activeBookings, icon: CalendarDays, color: 'bg-purple-500' },
    { label: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: CreditCard, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
            </div>
            <div className={`p-3 rounded-full ${card.color} text-white`}><card.icon className="w-6 h-6" /></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RoomsList = ({ user, onBook }: { user: User, onBook?: (room: Room) => void }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newRoom, setNewRoom] = useState<any>({ room_number: '', room_type: RoomType.SINGLE, price_per_night: 100, status: RoomStatus.AVAILABLE });

  const fetchRooms = () => api.getRooms().then(setRooms);
  useEffect(() => { fetchRooms(); }, []);

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addRoom(newRoom);
    setShowModal(false);
    fetchRooms();
  };

  const getStatusColor = (s: RoomStatus) => {
    switch (s) {
      case RoomStatus.AVAILABLE: return 'bg-green-100 text-green-700 border-green-200';
      case RoomStatus.OCCUPIED: return 'bg-red-100 text-red-700 border-red-200';
      case RoomStatus.MAINTENANCE: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">{user.role === 'admin' ? 'Rooms Management' : 'Available Rooms'}</h2>
        {user.role === 'admin' && (
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Room
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div key={room.room_id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-slate-100 p-2 rounded-lg"><BedDouble className="w-6 h-6 text-slate-600" /></div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(room.status)}`}>
                {room.status.toUpperCase()}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Room {room.room_number}</h3>
            <p className="text-slate-500 text-sm mb-4">{room.room_type} • ${room.price_per_night}/night</p>
            
            {user.role === 'admin' ? (
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button onClick={() => { if(confirm('Delete?')) api.deleteRoom(room.room_id).then(fetchRooms) }} className="flex-1 text-red-600 text-sm py-2 hover:bg-red-50 rounded">Delete</button>
                <button onClick={() => { api.updateRoomStatus(room.room_id, room.status === 'available' ? RoomStatus.MAINTENANCE : RoomStatus.AVAILABLE).then(fetchRooms) }} className="flex-1 text-slate-600 text-sm py-2 hover:bg-slate-50 rounded">Toggle Status</button>
              </div>
            ) : (
              room.status === RoomStatus.AVAILABLE && (
                <button onClick={() => onBook && onBook(room)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                  Book Now
                </button>
              )
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold">Add Room</h3>
            <form onSubmit={handleAddRoom} className="space-y-4">
              <input required placeholder="Room Number" className="w-full border rounded-lg p-2" value={newRoom.room_number} onChange={e => setNewRoom({...newRoom, room_number: e.target.value})} />
              <select className="w-full border rounded-lg p-2" value={newRoom.room_type} onChange={e => setNewRoom({...newRoom, room_type: e.target.value})}>
                {Object.values(RoomType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input required type="number" placeholder="Price" className="w-full border rounded-lg p-2" value={newRoom.price_per_night} onChange={e => setNewRoom({...newRoom, price_per_night: Number(e.target.value)})} />
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const BookingsList = ({ user, filterMyBookings = false }: { user: User, filterMyBookings?: boolean }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = () => {
    // If user is customer, filter by their customer_id
    const customerId = filterMyBookings ? user.customer_id : undefined;
    api.getBookings(customerId).then(setBookings);
  };

  useEffect(() => { fetchBookings(); }, [user, filterMyBookings]);

  const handleCancel = async (id: string) => {
    if (confirm('Cancel booking?')) {
      await api.cancelBooking(id);
      fetchBookings();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">{filterMyBookings ? 'My Reservations' : 'All Bookings'}</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {bookings.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No bookings found.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 text-slate-600">ID</th>
                <th className="p-4 text-slate-600">Room</th>
                {!filterMyBookings && <th className="p-4 text-slate-600">Customer</th>}
                <th className="p-4 text-slate-600">Dates</th>
                <th className="p-4 text-slate-600">Status</th>
                <th className="p-4 text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map(b => (
                <tr key={b.booking_id}>
                  <td className="p-4 font-mono text-xs text-slate-400">#{b.booking_id}</td>
                  <td className="p-4 font-medium">Room {b.room?.room_number}</td>
                  {!filterMyBookings && <td className="p-4 text-slate-600">{b.customer?.full_name}</td>}
                  <td className="p-4 text-sm text-slate-600">{format(new Date(b.check_in), 'MMM d')} - {format(new Date(b.check_out), 'MMM d')}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${b.booking_status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{b.booking_status}</span></td>
                  <td className="p-4 text-right">
                    {b.booking_status === BookingStatus.CONFIRMED && (
                      <button onClick={() => handleCancel(b.booking_id)} className="text-red-600 hover:underline text-sm">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const CustomersList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  useEffect(() => { api.getCustomers().then(setCustomers); }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Customers</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <ul className="divide-y">
          {customers.map(c => (
            <li key={c.customer_id} className="py-4 flex justify-between">
              <div>
                <p className="font-bold text-slate-800">{c.full_name}</p>
                <p className="text-sm text-slate-500">{c.email}</p>
              </div>
              <span className="text-sm text-slate-400">{c.phone}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const PaymentsList = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  useEffect(() => { api.getPayments().then(setPayments); }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Payments</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
            <thead className="bg-slate-50 border-b"><tr><th className="p-4 text-left">Date</th><th className="p-4 text-left">Method</th><th className="p-4 text-right">Amount</th></tr></thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.payment_id} className="border-b">
                  <td className="p-4 text-slate-600">{format(new Date(p.payment_date), 'MMM d')}</td>
                  <td className="p-4">{p.payment_method}</td>
                  <td className="p-4 text-right font-bold text-green-600">${p.amount_paid}</td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

// 5. Modal for Booking (Customer View)
const BookingModal = ({ room, user, onClose, onSuccess }: { room: Room, user: User, onClose: () => void, onSuccess: () => void }) => {
  const [form, setForm] = useState({
    check_in: new Date().toISOString().split('T')[0],
    check_out: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  const totalAmount = useMemo(() => {
    const diff = differenceInCalendarDays(new Date(form.check_out), new Date(form.check_in));
    return diff > 0 ? diff * room.price_per_night : 0;
  }, [form, room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!user.customer_id) {
       setError("Customer profile missing. Contact support.");
       return;
    }

    try {
      await api.createBooking({
        customer_id: user.customer_id,
        room_id: room.room_id,
        check_in: new Date(form.check_in).toISOString(),
        check_out: new Date(form.check_out).toISOString(),
        total_amount: totalAmount
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Book Room {room.room_number}</h3>
          <button onClick={onClose}><XCircle className="w-5 h-5 text-slate-400" /></button>
        </div>
        
        {error && <div className="p-2 bg-red-50 text-red-600 text-sm rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Check In</label>
              <input required type="date" className="w-full border rounded-lg p-2" 
                value={form.check_in} onChange={e => setForm({...form, check_in: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Check Out</label>
              <input required type="date" className="w-full border rounded-lg p-2" 
                value={form.check_out} onChange={e => setForm({...form, check_out: e.target.value})} />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
            <span className="text-slate-600">Total</span>
            <span className="text-xl font-bold text-blue-600">${totalAmount}</span>
          </div>

          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Confirm Booking</button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('');
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);

  // Initialize Tab based on hash or role
  useEffect(() => {
    if (user) {
      const hash = window.location.hash.replace('#', '');
      const validAdminTabs = ['dashboard', 'rooms', 'customers', 'bookings', 'payments'];
      const validCustomerTabs = ['my-bookings', 'book-room'];
      const validTabs = user.role === 'admin' ? validAdminTabs : validCustomerTabs;

      if (hash && validTabs.includes(hash)) {
        setActiveTab(hash);
      } else {
        // Fallback default
        setActiveTab(user.role === 'admin' ? 'dashboard' : 'my-bookings');
      }
    }
  }, [user]);

  // Sync Hash
  useEffect(() => {
    if (activeTab) {
      window.location.hash = activeTab;
    }
  }, [activeTab]);

  // Handle browser back button
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (user && hash) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user]);

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      // Admin Routes
      case 'dashboard': return <Dashboard />;
      case 'rooms': return <RoomsList user={user} />;
      case 'customers': return <CustomersList />;
      case 'bookings': return <BookingsList user={user} />;
      case 'payments': return <PaymentsList />;
      
      // Customer Routes
      case 'my-bookings': return <BookingsList user={user} filterMyBookings={true} />;
      case 'book-room': return <RoomsList user={user} onBook={setBookingRoom} />;
      
      default: return <div>404 Not Found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        user={user}
        onLogout={() => {
          setUser(null);
          window.location.hash = '';
        }}
      />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {bookingRoom && (
        <BookingModal 
          room={bookingRoom} 
          user={user}
          onClose={() => setBookingRoom(null)} 
          onSuccess={() => {
            setBookingRoom(null);
            setActiveTab('my-bookings');
          }} 
        />
      )}
    </div>
  );
}
