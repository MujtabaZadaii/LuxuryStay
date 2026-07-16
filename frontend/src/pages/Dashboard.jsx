import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { 
  LogOut, Home, Bed, FileText, Wrench, ShieldAlert, Sparkles, User, RefreshCw, Plus, 
  Trash, CheckCircle, CreditCard, ChevronRight, UserCheck, Star, Clock, AlertTriangle 
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  
  // Data lists
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [services, setServices] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Modals & Forms
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ roomNumber: '', roomType: 'Standard Room', floor: 1, capacity: 2, price: 100, amenities: '' });
  
  const [checkoutReservation, setCheckoutReservation] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({ paymentMethod: 'Cash', discount: 0 });
  const [billingSummary, setBillingSummary] = useState(null);
  
  const [newMaintenance, setNewMaintenance] = useState({ roomId: '', issue: '', priority: 'Medium' });
  const [newService, setNewService] = useState({ serviceType: 'Room Service', details: '' });
  const [newFeedback, setNewFeedback] = useState({ rating: 5, review: '' });
  
  const [bookingForm, setBookingForm] = useState({ roomId: '', checkInDate: '', checkOutDate: '', guests: 1 });
  
  // Success/error messages
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loggedUser = localStorage.getItem('user');
    if (!loggedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(loggedUser);
    setCurrentUser(parsedUser);
    
    // Set default tab based on role
    if (parsedUser.role === 'admin' || parsedUser.role === 'manager') {
      setActiveTab('analytics');
    } else if (parsedUser.role === 'receptionist') {
      setActiveTab('occupancy');
    } else if (parsedUser.role === 'housekeeping') {
      setActiveTab('housekeeping');
    } else if (parsedUser.role === 'maintenance') {
      setActiveTab('maintenance');
    } else {
      setActiveTab('book'); // guest
    }
  }, [navigate]);

  // Fetch Dashboard Stats & Collection Data
  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // 1. Stats for Admin/Manager
      if (currentUser.role === 'admin' || currentUser.role === 'manager') {
        const statsRes = await api.get('/operations/stats');
        if (statsRes.success) {
          setStats(statsRes.data.stats);
          setChartData(statsRes.data.charts);
        }
        const usersRes = await api.get('/auth/users');
        if (usersRes.success) setUsers(usersRes.data);
      }

      // 2. Room listings (needed by guest, admin, receptionist)
      const roomsRes = await api.get('/rooms');
      if (roomsRes.success) setRooms(roomsRes.data);

      // 3. Bookings/reservations
      const resRes = await api.get('/reservations');
      if (resRes.success) setReservations(resRes.data);

      // 4. Housekeeping tasks
      if (currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.role === 'housekeeping') {
        const hkRes = await api.get('/operations/housekeeping');
        if (hkRes.success) setTasks(hkRes.data);
      }

      // 5. Maintenance requests
      if (currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.role === 'maintenance' || currentUser.role === 'receptionist') {
        const maintRes = await api.get('/operations/maintenance');
        if (maintRes.success) setMaintenance(maintRes.data);
      }

      // 6. Guest specific services / feedback
      const svcRes = await api.get('/operations/services');
      if (svcRes.success) setServices(svcRes.data);

      const feedRes = await api.get('/operations/feedback');
      if (feedRes.success) setFeedbackList(feedRes.data);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setErrorMsg(err.message || 'Error loading dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Helper flash messages
  const showFlashMsg = (msg, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 5000);
    } else {
      setFeedbackMsg(msg);
      setTimeout(() => setFeedbackMsg(''), 5000);
    }
  };

  // --- ACTIONS ---

  // Admin: Add Room
  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const amenitiesArr = newRoom.amenities.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.post('/rooms', {
        ...newRoom,
        amenities: amenitiesArr,
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=85'] // default sample image
      });
      if (res.success) {
        showRoomModal(false);
        setNewRoom({ roomNumber: '', roomType: 'Standard Room', floor: 1, capacity: 2, price: 100, amenities: '' });
        showFlashMsg(`Room ${res.data.roomNumber} created successfully.`);
        fetchData();
      }
    } catch (err) {
      showFlashMsg(err.message, true);
    }
  };

  // Admin: Delete Room
  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      const res = await api.delete(`/rooms/${id}`);
      if (res.success) {
        showFlashMsg('Room deleted successfully.');
        fetchData();
      }
    } catch (err) {
      showFlashMsg(err.message, true);
    }
  };

  // Admin: Toggle user status
  const handleToggleUserStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      const res = await api.put(`/auth/users/${user._id}`, { status: newStatus });
      if (res.success) {
        showFlashMsg(`Status of ${user.fullName} updated to ${newStatus}.`);
        fetchData();
      }
    } catch (err) {
      showFlashMsg(err.message, true);
    }
  };

  // Guest: Book Room
  const handleBookRoom = async (e) => {
    e.preventDefault();
    if (!bookingForm.roomId || !bookingForm.checkInDate || !bookingForm.checkOutDate) {
      showFlashMsg('Please fill in all booking fields.', true);
      return;
    }
    try {
      const res = await api.post('/reservations', bookingForm);
      if (res.success) {
        showFlashMsg('Booking reservation requested successfully! Status is pending check-in.');
        setBookingForm({ roomId: '', checkInDate: '', checkOutDate: '', guests: 1 });
        fetchData();
      }
    } catch (err) {
      showFlashMsg(err.message, true);
    }
  };

  // Guest: Request Service
  const handleServiceRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/operations/services', newService);
      if (res.success) {
        showFlashMsg(`${newService.serviceType} requested.`);
        setNewService({ serviceType: 'Room Service', details: '' });
        fetchData();
      }
    } catch (err) {
      showFlashMsg(err.message, true);
    }
  };

  // Guest: Submit Feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/operations/feedback', newFeedback);
      if (res.success) {
        showFlashMsg('Thank you for your warm review!');
        setNewFeedback({ rating: 5, review: '' });
        fetchData();
      }
    } catch (err) {
      showFlashMsg(err.message, true);
    }
  };

  // Receptionist: Check-In
  const handleCheckIn = async (resId) => {
    try {
      const res = await api.put(`/reservations/${resId}/checkin`);
      if (res.success) {
        showFlashMsg('Guest checked in successfully. Room status is Occupied.');
        fetchData();
      }
    } catch (err) {
      showFlashMsg(err.message, true);
    }
  };

  // Receptionist: Calculate Billing Preview before checkout
  const openCheckoutPreview = (res) => {
    setCheckoutReservation(res);
    // Auto-calculate subtotal
    const oneDay = 24 * 60 * 60 * 1000;
    const checkIn = new Date(res.checkInDate);
    const checkOut = new Date();
    const diffDays = Math.max(1, Math.round(Math.abs((checkOut - checkIn) / oneDay)));
    
    const roomRate = res.roomId.price;
    const roomCharges = roomRate * diffDays;
    
    // Calculate service fees
    const serviceRates = {
      'Room Service': 25,
      'Laundry': 15,
      'Airport Pickup': 50,
      'Taxi': 20,
      'Wake-Up Call': 0,
      'Extra Towels': 5,
      'Housekeeping': 0,
      'Food Delivery': 10
    };
    
    let serviceCharges = 0;
    const guestCompletedServices = services.filter(s => s.guestId._id === res.guestId._id && s.requestStatus === 'Completed');
    guestCompletedServices.forEach(s => {
      serviceCharges += serviceRates[s.serviceType] || 0;
    });

    const subtotal = roomCharges + serviceCharges;
    const tax = Math.round(subtotal * 0.12);
    
    setBillingSummary({
      days: diffDays,
      roomCharges,
      serviceCharges,
      subtotal,
      tax
    });
  };

  // Receptionist: Check-Out Process
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!checkoutReservation) return;
    try {
      const res = await api.put(`/reservations/${checkoutReservation._id}/checkout`, checkoutForm);
      if (res.success) {
        showFlashMsg(`Checked out guest. Room status set to Cleaning. Invoice of $${res.data.invoice.totalAmount} generated.`);
        setCheckoutReservation(null);
        fetchData();
      }
    } catch (err) {
      showFlashMsg(err.message, true);
    }
  };

  // Staff (Housekeeper): Complete Task
  const handleCompleteHousekeeping = async (taskId) => {
    try {
      const res = await api.put(`/operations/housekeeping/${taskId}`, { taskStatus: 'Completed' });
      if (res.success) {
        showFlashMsg('Room cleaning complete. Room is now Available.');
        fetchData();
      }
    } catch (err) {
      showFlashMsg(err.message, true);
    }
  };

  // Staff (Technician): Complete repair
  const handleCompleteMaintenance = async (maintId) => {
    try {
      const res = await api.put(`/operations/maintenance/${maintId}`, { status: 'Resolved' });
      if (res.success) {
        showFlashMsg('Maintenance ticket resolved. Room is now Available.');
        fetchData();
      }
    } catch (err) {
      showFlashMsg(err.message, true);
    }
  };

  // Staff: Create manual maintenance request
  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    if (!newMaintenance.roomId || !newMaintenance.issue) {
      showFlashMsg('Please select room and describe issue.', true);
      return;
    }
    try {
      const res = await api.post('/operations/maintenance', newMaintenance);
      if (res.success) {
        showFlashMsg('Maintenance ticket raised.');
        setNewMaintenance({ roomId: '', issue: '', priority: 'Medium' });
        fetchData();
      }
    } catch (err) {
      showFlashMsg(err.message, true);
    }
  };

  // Receptionist: Complete Guest Service Request
  const handleCompleteService = async (serviceId) => {
    try {
      const res = await api.put(`/operations/services/${serviceId}`, { requestStatus: 'Completed' });
      if (res.success) {
        showFlashMsg('Service request marked completed.');
        fetchData();
      }
    } catch (err) {
      showFlashMsg(err.message, true);
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw className="animate-spin" size={36} style={{ color: 'var(--color-coral)', margin: '0 auto 1rem auto' }} />
          <p style={{ color: 'var(--color-muted)' }}>Preparing your digital living room workspace...</p>
        </div>
      </div>
    );
  }

  // Define sidebar links based on role
  const getSidebarLinks = () => {
    const role = currentUser.role;
    if (role === 'admin' || role === 'manager') {
      return [
        { tab: 'analytics', label: 'analytics & charts', icon: <Home size={18} /> },
        { tab: 'rooms', label: 'rooms catalog', icon: <Bed size={18} /> },
        { tab: 'reservations', label: 'reservations log', icon: <FileText size={18} /> },
        { tab: 'staff', label: 'staff accounts', icon: <UserCheck size={18} /> },
        { tab: 'maintenance', label: 'maintenance tickets', icon: <Wrench size={18} /> },
        { tab: 'reviews', label: 'guest reviews', icon: <Star size={18} /> }
      ];
    } else if (role === 'receptionist') {
      return [
        { tab: 'occupancy', label: 'occupancy board', icon: <Home size={18} /> },
        { tab: 'bookings', label: 'check-in / out', icon: <FileText size={18} /> },
        { tab: 'services', label: 'guest services', icon: <Sparkles size={18} /> },
        { tab: 'maint-log', label: 'report repair', icon: <Wrench size={18} /> }
      ];
    } else if (role === 'housekeeping') {
      return [
        { tab: 'housekeeping', label: 'cleaning tasks', icon: <Sparkles size={18} /> }
      ];
    } else if (role === 'maintenance') {
      return [
        { tab: 'maintenance', label: 'my repair tickets', icon: <Wrench size={18} /> }
      ];
    } else {
      // Guest
      return [
        { tab: 'book', label: 'reserve a room', icon: <Bed size={18} /> },
        { tab: 'stay', label: 'active stay & services', icon: <Sparkles size={18} /> },
        { tab: 'history', label: 'billing history', icon: <FileText size={18} /> }
      ];
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-logo">
            <div className="nav-dot"></div>
            <span>luxurystay</span>
          </div>

          <nav className="sidebar-menu">
            {getSidebarLinks().map((link) => (
              <button
                key={link.tab}
                onClick={() => setActiveTab(link.tab)}
                className={`sidebar-item ${activeTab === link.tab ? 'sidebar-item-active' : ''}`}
                style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div>
          <div className="sidebar-user">
            <div className="user-avatar">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser.fullName}</span>
              <span className="user-role">{currentUser.role}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="sidebar-item" 
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', marginTop: '1rem', color: '#a8332a' }}
          >
            <LogOut size={18} />
            <span>sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h2>{activeTab.replace('-', ' ')}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>
              Local Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button 
              onClick={fetchData} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Flash notifications */}
          {feedbackMsg && (
            <div style={{ background: 'var(--color-sage)', color: '#2d5a27', padding: '0.75rem 1.5rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {feedbackMsg}
            </div>
          )}
          {errorMsg && (
            <div style={{ background: '#ffe8e6', color: '#a8332a', padding: '0.75rem 1.5rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {errorMsg}
            </div>
          )}

          {/* ADMIN & MANAGER - ANALYTICS TAB */}
          {activeTab === 'analytics' && stats && (
            <div>
              {/* Quick Summary Cards */}
              <div className="stats-grid">
                <div className="stats-card">
                  <div className="stats-info">
                    <span className="stats-label">Occupancy Rate</span>
                    <span className="stats-value">{stats.occupancyRate}%</span>
                  </div>
                  <div className="stats-icon"><Bed size={24} /></div>
                </div>

                <div className="stats-card">
                  <div className="stats-info">
                    <span className="stats-label">Total Revenue</span>
                    <span className="stats-value">${stats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="stats-icon"><CreditCard size={24} /></div>
                </div>

                <div className="stats-card">
                  <div className="stats-info">
                    <span className="stats-label">Guests Registered</span>
                    <span className="stats-value">{stats.totalGuests}</span>
                  </div>
                  <div className="stats-icon"><User size={24} /></div>
                </div>

                <div className="stats-card">
                  <div className="stats-info">
                    <span className="stats-label">Active Staff Online</span>
                    <span className="stats-value">{stats.staffOnline}</span>
                  </div>
                  <div className="stats-icon"><UserCheck size={24} /></div>
                </div>
              </div>

              {/* Graphical representation panels */}
              <div className="dashboard-grid-2">
                <div className="chart-panel">
                  <h3>monthly occupancy vs revenue</h3>
                  <div style={{ width: '100%', height: 300, marginTop: '1.5rem' }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" orientation="left" stroke="var(--color-dark)" />
                        <YAxis yAxisId="right" orientation="right" stroke="var(--color-coral)" />
                        <Tooltip />
                        <Bar yAxisId="left" dataKey="revenue" name="Revenue ($)" fill="var(--color-dark)" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="occupancy" name="Occupancy (%)" fill="var(--color-coral)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="list-panel">
                  <h3>operational status</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                    <div className="flex-between">
                      <span>Available Rooms</span>
                      <span className="badge badge-available">{stats.availableRooms}</span>
                    </div>
                    <div className="flex-between">
                      <span>Occupied Rooms</span>
                      <span className="badge badge-occupied">{stats.occupiedRooms}</span>
                    </div>
                    <div className="flex-between">
                      <span>Cleaning Backlog</span>
                      <span className="badge badge-cleaning">{stats.pendingHousekeeping} tasks</span>
                    </div>
                    <div className="flex-between">
                      <span>Pending Repairs</span>
                      <span className="badge badge-maintenance">{stats.pendingMaintenance} tickets</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN & MANAGER - ROOMS CATALOG TAB */}
          {activeTab === 'rooms' && (
            <div>
              <div className="flex-between">
                <h3>Hotel Room Database</h3>
                <button onClick={() => setShowRoomModal(true)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  <Plus size={16} /> Add Room
                </button>
              </div>

              {/* Room Addition Modal */}
              {showRoomModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(41,37,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                  <div className="auth-card" style={{ maxWidth: '500px' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>add new room to catalog</h3>
                    <form onSubmit={handleAddRoom}>
                      <div className="form-group">
                        <label className="form-label">Room Number</label>
                        <input 
                          type="text" 
                          className="form-input"
                          value={newRoom.roomNumber}
                          onChange={(e) => setNewRoom({...newRoom, roomNumber: e.target.value})}
                          placeholder="e.g. 303"
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Room Type</label>
                        <select 
                          className="form-select"
                          value={newRoom.roomType}
                          onChange={(e) => setNewRoom({...newRoom, roomType: e.target.value})}
                        >
                          <option value="Standard Room">Standard Room</option>
                          <option value="Deluxe Oasis">Deluxe Oasis</option>
                          <option value="Executive Suite">Executive Suite</option>
                          <option value="Grand Penthouse">Grand Penthouse</option>
                        </select>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Floor</label>
                          <input type="number" className="form-input" value={newRoom.floor} onChange={(e) => setNewRoom({...newRoom, floor: e.target.value})} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Capacity</label>
                          <input type="number" className="form-input" value={newRoom.capacity} onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Price ($)</label>
                          <input type="number" className="form-input" value={newRoom.price} onChange={(e) => setNewRoom({...newRoom, price: e.target.value})} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Amenities (comma separated)</label>
                        <input type="text" className="form-input" placeholder="Wi-Fi, Balcony, Minibar" value={newRoom.amenities} onChange={(e) => setNewRoom({...newRoom, amenities: e.target.value})} />
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button type="submit" className="auth-btn" style={{ flex: 1, marginTop: 0 }}>Add Room</button>
                        <button type="button" onClick={() => setShowRoomModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Room Grid */}
              <div className="room-grid">
                {rooms.map((room) => (
                  <div key={room._id} className="room-card">
                    <div>
                      <img src={room.images[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=85'} alt={room.roomType} className="room-card-img" />
                      <div className="room-card-body">
                        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 600 }}>Room {room.roomNumber}</span>
                          <span className={`badge badge-${room.status.toLowerCase().replace(' ', '_')}`}>{room.status}</span>
                        </div>
                        <h4 style={{ textTransform: 'none' }}>{room.roomType}</h4>
                        <div className="room-amenities-tags">
                          {room.amenities.map((am, i) => (
                            <span key={i} className="amenity-tag">{am}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="room-card-footer">
                      <div className="room-price-tag">
                        ${room.price}<span className="room-price-period">/night</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteRoom(room._id)}
                        style={{ border: 'none', background: 'none', color: '#a8332a', cursor: 'pointer' }}
                        title="Delete Room"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADMIN & MANAGER - RESERVATIONS LOG TAB */}
          {activeTab === 'reservations' && (
            <div className="list-panel">
              <h3>Hotel Reservation Log</h3>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Dates</th>
                    <th>Payment</th>
                    <th>Booking Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((res) => (
                    <tr key={res._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{res.guestId?.fullName || 'Deleted Guest'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{res.guestId?.email}</div>
                      </td>
                      <td>
                        <div>Room {res.roomId?.roomNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{res.roomId?.roomType}</div>
                      </td>
                      <td>
                        <div>In: {new Date(res.checkInDate).toLocaleDateString()}</div>
                        <div>Out: {new Date(res.checkOutDate).toLocaleDateString()}</div>
                      </td>
                      <td>
                        <span className={`badge badge-${res.paymentStatus === 'Paid' ? 'available' : 'occupied'}`}>{res.paymentStatus}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${res.bookingStatus.toLowerCase().replace(' ', '_')}`}>{res.bookingStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ADMIN & MANAGER - STAFF ACCOUNTS */}
          {activeTab === 'staff' && (
            <div className="list-panel">
              <h3>staff and guest accounts</h3>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                      <td>{u.email}</td>
                      <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                      <td>
                        <span className={`badge ${u.status === 'active' ? 'badge-available' : 'badge-occupied'}`}>{u.status}</span>
                      </td>
                      <td>
                        {u.role !== 'admin' && (
                          <button 
                            onClick={() => handleToggleUserStatus(u)}
                            className="btn-secondary" 
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px' }}
                          >
                            {u.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* RECEPTIONIST - OCCUPANCY BOARD TAB */}
          {activeTab === 'occupancy' && (
            <div>
              <h3>Real-Time Occupancy Board</h3>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>Visual representation of all hotel rooms and their immediate status.</p>
              
              <div className="room-grid">
                {rooms.map((room) => (
                  <div key={room._id} className="room-card" style={{ borderTop: `6px solid ${
                    room.status === 'Available' ? 'var(--color-sage)' :
                    room.status === 'Occupied' ? '#FFB7B2' :
                    room.status === 'Reserved' ? '#FFE4E1' :
                    room.status === 'Cleaning' ? 'var(--color-lavender)' : '#78716C'
                  }` }}>
                    <div className="room-card-body" style={{ padding: '1.5rem' }}>
                      <div className="flex-between">
                        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>Room {room.roomNumber}</span>
                        <span className={`badge badge-${room.status.toLowerCase().replace(' ', '_')}`}>{room.status}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginTop: '0.5rem' }}>{room.roomType}</p>
                      <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Floor {room.floor} &bull; Capacity {room.capacity} guests</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RECEPTIONIST - CHECK-IN / CHECK-OUT BOOKINGS */}
          {activeTab === 'bookings' && (
            <div>
              <div className="list-panel">
                <h3>Arrivals / Check-In Queue</h3>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Guest</th>
                      <th>Room</th>
                      <th>Check-in Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.filter(r => r.bookingStatus === 'Pending' || r.bookingStatus === 'Confirmed').map((res) => (
                      <tr key={res._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{res.guestId?.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{res.guestId?.phone}</div>
                        </td>
                        <td>Room {res.roomId?.roomNumber} ({res.roomId?.roomType})</td>
                        <td>{new Date(res.checkInDate).toLocaleDateString()}</td>
                        <td><span className="badge badge-reserved">{res.bookingStatus}</span></td>
                        <td>
                          <button 
                            onClick={() => handleCheckIn(res._id)} 
                            className="btn-primary" 
                            style={{ padding: '0.4rem 0.875rem', fontSize: '0.85rem', boxShadow: 'none' }}
                          >
                            Check In
                          </button>
                        </td>
                      </tr>
                    ))}
                    {reservations.filter(r => r.bookingStatus === 'Pending' || r.bookingStatus === 'Confirmed').length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-muted)' }}>No pending check-ins today.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="list-panel">
                <h3>Departures / Check-Out Queue</h3>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Guest</th>
                      <th>Room</th>
                      <th>Check-in Date</th>
                      <th>Billing Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.filter(r => r.bookingStatus === 'CheckedIn').map((res) => (
                      <tr key={res._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{res.guestId?.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{res.guestId?.email}</div>
                        </td>
                        <td>Room {res.roomId?.roomNumber}</td>
                        <td>{new Date(res.checkInDate).toLocaleDateString()}</td>
                        <td><span className="badge badge-occupied">{res.paymentStatus}</span></td>
                        <td>
                          <button 
                            onClick={() => openCheckoutPreview(res)} 
                            className="btn-secondary" 
                            style={{ padding: '0.4rem 0.875rem', fontSize: '0.85rem', borderColor: 'var(--color-coral)' }}
                          >
                            Checkout & Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                    {reservations.filter(r => r.bookingStatus === 'CheckedIn').length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-muted)' }}>No occupied rooms.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Checkout Billing Modal */}
              {checkoutReservation && billingSummary && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(41,37,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                  <div className="auth-card" style={{ maxWidth: '500px', padding: '2.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>final guest billing</h3>
                    
                    <div style={{ borderBottom: '1px dashed rgba(41,37,36,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <div className="flex-between" style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--color-muted)' }}>Guest Name</span>
                        <span style={{ fontWeight: 600 }}>{checkoutReservation.guestId?.fullName}</span>
                      </div>
                      <div className="flex-between" style={{ fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--color-muted)' }}>Room Assigned</span>
                        <span style={{ fontWeight: 600 }}>Room {checkoutReservation.roomId?.roomNumber}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
                      <div className="flex-between">
                        <span>Room Charges ({billingSummary.days} nights)</span>
                        <span>${billingSummary.roomCharges}</span>
                      </div>
                      <div className="flex-between">
                        <span>Completed Services Fees</span>
                        <span>${billingSummary.serviceCharges}</span>
                      </div>
                      <div className="flex-between" style={{ fontWeight: 'bold' }}>
                        <span>Subtotal</span>
                        <span>${billingSummary.subtotal}</span>
                      </div>
                      <div className="flex-between" style={{ color: 'var(--color-muted)' }}>
                        <span>Tax (12%)</span>
                        <span>${billingSummary.tax}</span>
                      </div>
                    </div>

                    <form onSubmit={handleCheckoutSubmit} style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(41,37,36,0.08)', paddingTop: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Discount Amount ($)</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          value={checkoutForm.discount} 
                          onChange={(e) => setCheckoutForm({...checkoutForm, discount: Number(e.target.value)})} 
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Payment Method</label>
                        <select 
                          className="form-select"
                          value={checkoutForm.paymentMethod}
                          onChange={(e) => setCheckoutForm({...checkoutForm, paymentMethod: e.target.value})}
                        >
                          <option value="Cash">Cash</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Debit Card">Debit Card</option>
                          <option value="Online Payment">Online Payment</option>
                        </select>
                      </div>

                      <div className="flex-between" style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '1.5rem 0' }}>
                        <span>total due:</span>
                        <span style={{ color: 'var(--color-coral)' }}>
                          ${Math.max(0, billingSummary.subtotal + billingSummary.tax - (checkoutForm.discount || 0))}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="auth-btn" style={{ flex: 1, marginTop: 0 }}>Process Checkout</button>
                        <button type="button" onClick={() => setCheckoutReservation(null)} className="btn-secondary" style={{ flex: 1 }}>Close</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RECEPTIONIST - GUEST SERVICES ROUTING TAB */}
          {activeTab === 'services' && (
            <div className="list-panel">
              <h3>Active Guest Service Requests</h3>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Service Type</th>
                    <th>Details</th>
                    <th>Time Requested</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((svc) => (
                    <tr key={svc._id}>
                      <td style={{ fontWeight: 600 }}>{svc.guestId?.fullName}</td>
                      <td><span className="badge badge-cleaning">{svc.serviceType}</span></td>
                      <td>{svc.details}</td>
                      <td>{new Date(svc.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td><span className={`badge badge-${svc.requestStatus === 'Completed' ? 'available' : 'occupied'}`}>{svc.requestStatus}</span></td>
                      <td>
                        {svc.requestStatus === 'Pending' && (
                          <button 
                            onClick={() => handleCompleteService(svc._id)} 
                            className="btn-primary" 
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', boxShadow: 'none' }}
                          >
                            Mark Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {services.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-muted)' }}>No service requests active.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* STAFF: HOUSEKEEPING TASK LIST */}
          {activeTab === 'housekeeping' && (
            <div className="list-panel">
              <h3>cleaning assignments</h3>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Type</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task._id}>
                      <td style={{ fontWeight: 700 }}>Room {task.roomId?.roomNumber}</td>
                      <td>{task.roomId?.roomType}</td>
                      <td>{task.assignedStaff?.fullName}</td>
                      <td>
                        <span className={`badge badge-${task.taskStatus.toLowerCase().replace(' ', '_')}`}>{task.taskStatus}</span>
                      </td>
                      <td>
                        {task.taskStatus !== 'Completed' && (
                          <button 
                            onClick={() => handleCompleteHousekeeping(task._id)}
                            className="btn-primary" 
                            style={{ padding: '0.4rem 0.875rem', fontSize: '0.85rem', boxShadow: 'none' }}
                          >
                            Mark Clean
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-muted)' }}>No housekeeping tasks assigned.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* STAFF: MAINTENANCE TICKETS */}
          {(activeTab === 'maintenance' || activeTab === 'maint-log') && (
            <div>
              {/* Form to raise manual ticket (by receptionist or staff) */}
              <div className="list-panel" style={{ marginBottom: '2rem' }}>
                <h3>Report Repair / Maintenance Issue</h3>
                <form onSubmit={handleCreateMaintenance} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginTop: '1rem' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
                    <label className="form-label">Select Room</label>
                    <select 
                      className="form-select"
                      value={newMaintenance.roomId}
                      onChange={(e) => setNewMaintenance({...newMaintenance, roomId: e.target.value})}
                      required
                    >
                      <option value="">-- Choose Room --</option>
                      {rooms.map(r => (
                        <option key={r._id} value={r._id}>Room {r.roomNumber} ({r.roomType})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 2, minWidth: '200px', marginBottom: 0 }}>
                    <label className="form-label">Describe Issue</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Toilet leaking water / Light bulb fused"
                      value={newMaintenance.issue}
                      onChange={(e) => setNewMaintenance({...newMaintenance, issue: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '120px', marginBottom: 0 }}>
                    <label className="form-label">Priority</label>
                    <select 
                      className="form-select"
                      value={newMaintenance.priority}
                      onChange={(e) => setNewMaintenance({...newMaintenance, priority: e.target.value})}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', boxShadow: 'none' }}>Report</button>
                </form>
              </div>

              {/* Maintenance List */}
              <div className="list-panel">
                <h3>Active Maintenance Tickets</h3>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Room</th>
                      <th>Issue</th>
                      <th>Priority</th>
                      <th>Assigned Tech</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenance.map((item) => (
                      <tr key={item._id}>
                        <td style={{ fontWeight: 700 }}>Room {item.roomId?.roomNumber}</td>
                        <td>{item.issue}</td>
                        <td>
                          <span className={`badge ${
                            item.priority === 'High' ? 'badge-occupied' : 
                            item.priority === 'Medium' ? 'badge-reserved' : 'badge-available'
                          }`}>{item.priority}</span>
                        </td>
                        <td>{item.assignedTo?.fullName || 'Auto-assigning...'}</td>
                        <td><span className={`badge badge-${item.status.toLowerCase().replace(' ', '_')}`}>{item.status}</span></td>
                        <td>
                          {item.status !== 'Resolved' && (currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.role === 'maintenance') && (
                            <button 
                              onClick={() => handleCompleteMaintenance(item._id)}
                              className="btn-primary" 
                              style={{ padding: '0.4rem 0.875rem', fontSize: '0.85rem', boxShadow: 'none' }}
                            >
                              Mark Resolved
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {maintenance.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-muted)' }}>No active repair tickets.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADMIN: REVIEWS LOG TAB */}
          {activeTab === 'reviews' && (
            <div className="list-panel">
              <h3>Guest Feedbacks & Ratings</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                {feedbackList.map((fb) => (
                  <div key={fb._id} style={{ borderBottom: '1px solid rgba(41,37,36,0.05)', paddingBottom: '1.5rem' }}>
                    <div className="flex-between">
                      <h4 style={{ textTransform: 'none' }}>{fb.guestId?.fullName}</h4>
                      <div style={{ display: 'flex', color: 'var(--color-coral)' }}>
                        {[...Array(fb.rating)].map((_, i) => <Star key={i} size={16} fill="var(--color-coral)" />)}
                      </div>
                    </div>
                    <p style={{ marginTop: '0.5rem', color: 'var(--color-muted)', fontStyle: 'italic', fontSize: '0.95rem' }}>
                      “{fb.review}”
                    </p>
                  </div>
                ))}
                {feedbackList.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--color-muted)' }}>No feedback submitted yet.</p>
                )}
              </div>
            </div>
          )}

          {/* GUEST - BOOK A ROOM TAB */}
          {activeTab === 'book' && (
            <div>
              <div className="dashboard-grid-2">
                <div>
                  <h3>available rooms for booking</h3>
                  <div className="room-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {rooms.filter(r => r.status === 'Available').map(room => (
                      <div key={room._id} className="room-card" style={{ border: bookingForm.roomId === room._id ? '2px solid var(--color-coral)' : '1px solid rgba(41,37,36,0.05)' }}>
                        <img src={room.images[0]} alt={room.roomType} className="room-card-img" style={{ height: '140px' }} />
                        <div className="room-card-body">
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)', fontWeight: 600 }}>Room {room.roomNumber}</span>
                          <h4 style={{ textTransform: 'none', margin: '0.25rem 0' }}>{room.roomType}</h4>
                          <div className="room-price-tag" style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>
                            ${room.price}<span className="room-price-period">/night</span>
                          </div>
                          <button 
                            onClick={() => setBookingForm({...bookingForm, roomId: room._id})}
                            className="btn-secondary" 
                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', backgroundColor: bookingForm.roomId === room._id ? 'var(--color-coral)' : 'white' }}
                          >
                            {bookingForm.roomId === room._id ? 'Selected' : 'Select Room'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="list-panel" style={{ height: 'fit-content' }}>
                  <h3>reservation dates</h3>
                  <form onSubmit={handleBookRoom} style={{ marginTop: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Check-In Date</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={bookingForm.checkInDate}
                        onChange={(e) => setBookingForm({...bookingForm, checkInDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Check-Out Date</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={bookingForm.checkOutDate}
                        onChange={(e) => setBookingForm({...bookingForm, checkOutDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Number of Guests</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={bookingForm.guests}
                        onChange={(e) => setBookingForm({...bookingForm, guests: e.target.value})}
                        min="1"
                        max="6"
                        required
                      />
                    </div>
                    <button type="submit" className="auth-btn" style={{ width: '100%' }}>Book Reservation</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* GUEST - STAY & SERVICES TAB */}
          {activeTab === 'stay' && (
            <div className="dashboard-grid-2">
              <div>
                <div className="list-panel">
                  <h3>your active stay details</h3>
                  {reservations.find(r => r.bookingStatus === 'CheckedIn') ? (
                    (() => {
                      const activeRes = reservations.find(r => r.bookingStatus === 'CheckedIn');
                      return (
                        <div style={{ marginTop: '1rem' }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--color-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🔑</div>
                            <div>
                              <h4 style={{ textTransform: 'none' }}>Room {activeRes.roomId?.roomNumber}</h4>
                              <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>{activeRes.roomId?.roomType}</span>
                            </div>
                          </div>
                          <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                            You are checked in! Your stay started on {new Date(activeRes.checkInDate).toLocaleDateString()} and is scheduled to end on {new Date(activeRes.checkOutDate).toLocaleDateString()}.
                          </p>
                        </div>
                      );
                    })()
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                      <Clock size={36} style={{ color: 'var(--color-muted)', marginBottom: '1rem' }} />
                      <p style={{ color: 'var(--color-muted)' }}>No active check-in stay found. Pending bookings are shown in your log.</p>
                    </div>
                  )}
                </div>

                <div className="list-panel">
                  <h3>room services & amenities</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>Request custom amenities directly to your door.</p>
                  
                  <form onSubmit={handleServiceRequest}>
                    <div className="form-group">
                      <label className="form-label">Service Type</label>
                      <select 
                        className="form-select"
                        value={newService.serviceType}
                        onChange={(e) => setNewService({...newService, serviceType: e.target.value})}
                      >
                        <option value="Room Service">Room Service (Chamomile Tea / Snacks)</option>
                        <option value="Laundry">Laundry Services</option>
                        <option value="Extra Towels">Extra Towels & Linens</option>
                        <option value="Airport Pickup">Airport Pickup Schedule</option>
                        <option value="Taxi">Call Taxi / Transport</option>
                        <option value="Wake-Up Call">Morning Wake-Up Call</option>
                        <option value="Food Delivery">Food Delivery</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Additional Instructions</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. Please deliver at 8:00 AM, sugar on side." 
                        value={newService.details}
                        onChange={(e) => setNewService({...newService, details: e.target.value})}
                      />
                    </div>
                    <button type="submit" className="auth-btn" style={{ width: '100%' }}>Submit Service Request</button>
                  </form>
                </div>
              </div>

              <div>
                <div className="list-panel">
                  <h3>leave a bedside note</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>Share your stay feedback on our living room journal.</p>
                  <form onSubmit={handleFeedbackSubmit}>
                    <div className="form-group">
                      <label className="form-label">Rating</label>
                      <select 
                        className="form-select"
                        value={newFeedback.rating}
                        onChange={(e) => setNewFeedback({...newFeedback, rating: Number(e.target.value)})}
                      >
                        <option value="5">★★★★★ (Excellent sanctuary)</option>
                        <option value="4">★★★★☆ (Very relaxing)</option>
                        <option value="3">★★★☆☆ (Averages)</option>
                        <option value="2">★★☆☆☆ (Needs improvement)</option>
                        <option value="1">★☆☆☆☆ (Dissatisfied)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label"> Bedside Note Review</label>
                      <textarea 
                        className="form-textarea" 
                        rows="4" 
                        placeholder="Write your diary message..."
                        value={newFeedback.review}
                        onChange={(e) => setNewFeedback({...newFeedback, review: e.target.value})}
                        required
                      />
                    </div>
                    <button type="submit" className="auth-btn" style={{ width: '100%' }}>Submit Bedside Review</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* GUEST - BILLING & BOOKING HISTORY */}
          {activeTab === 'history' && (
            <div className="list-panel">
              <h3>Your Booking Records & Invoices</h3>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Stay Dates</th>
                    <th>Payment Status</th>
                    <th>Booking Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((res) => (
                    <tr key={res._id}>
                      <td style={{ fontWeight: 600 }}>Room {res.roomId?.roomNumber} ({res.roomId?.roomType})</td>
                      <td>
                        {new Date(res.checkInDate).toLocaleDateString()} &mdash; {new Date(res.checkOutDate).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge badge-${res.paymentStatus === 'Paid' ? 'available' : 'occupied'}`}>{res.paymentStatus}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${res.bookingStatus.toLowerCase().replace(' ', '_')}`}>{res.bookingStatus}</span>
                      </td>
                    </tr>
                  ))}
                  {reservations.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--color-muted)' }}>You have no reservations logged yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
