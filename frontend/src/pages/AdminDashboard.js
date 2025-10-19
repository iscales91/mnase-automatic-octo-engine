import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Calendar, MapPin, DollarSign } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { canAccessAdminDashboard } from '@/utils/roleUtils';
import RestrictedAccess from '@/components/RestrictedAccess';
import UserManagement from '@/components/admin/UserManagement';
import BillingInvoices from '@/components/admin/BillingInvoices';
import PaymentPlans from '@/components/admin/PaymentPlans';
import CalendarManagement from '@/components/admin/CalendarManagement';
import FormSubmissions from '@/components/admin/FormSubmissions';
import TeamsManagement from '@/components/admin/TeamsManagement';
import RegistrationsManagement from '@/components/admin/RegistrationsManagement';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import RolesManagement from '@/components/admin/RolesManagement';
import ActivityLogs from '@/components/admin/ActivityLogs';
import StatsManagement from '@/components/admin/StatsManagement';
import AffiliateManagement from '@/components/admin/AffiliateManagement';
import TicketManagement from '@/components/admin/TicketManagement';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showFacilityDialog, setShowFacilityDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingFacility, setEditingFacility] = useState(null);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Check if user has admin access
  if (!token || !canAccessAdminDashboard(user)) {
    return (
      <RestrictedAccess 
        message="You need admin privileges to access the Admin Dashboard."
        requiredRole="Admin, Manager, Staff, Coach, or Treasurer"
      />
    );
  }

  const [eventForm, setEventForm] = useState({
    title: '', description: '', date: '', time: '',
    location: '', capacity: '', price: '', category: ''
  });

  const [facilityForm, setFacilityForm] = useState({
    name: '', description: '', hourly_rate: '',
    amenities: '', capacity: '', available: true
  });

  useEffect(() => {
    if (!token || !['admin', 'super_admin'].includes(user.role)) {
      navigate('/');
      return;
    }
    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [eventsRes, facRes, regRes, bookRes] = await Promise.all([
        axios.get(`${API}/events`),
        axios.get(`${API}/facilities`),
        axios.get(`${API}/registrations`, { headers }),
        axios.get(`${API}/bookings`, { headers })
      ]);
      setEvents(eventsRes.data);
      setFacilities(facRes.data);
      setRegistrations(regRes.data);
      setBookings(bookRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const data = {
        ...eventForm,
        capacity: parseInt(eventForm.capacity),
        price: parseFloat(eventForm.price)
      };
      
      if (editingEvent) {
        await axios.put(`${API}/events/${editingEvent.id}`, data, { headers });
        toast.success('Event updated successfully');
      } else {
        await axios.post(`${API}/events`, data, { headers });
        toast.success('Event created successfully');
      }
      
      setShowEventDialog(false);
      setEditingEvent(null);
      setEventForm({ title: '', description: '', date: '', time: '', location: '', capacity: '', price: '', category: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleCreateFacility = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const data = {
        ...facilityForm,
        hourly_rate: parseFloat(facilityForm.hourly_rate),
        capacity: parseInt(facilityForm.capacity),
        amenities: facilityForm.amenities.split(',').map(a => a.trim())
      };
      
      if (editingFacility) {
        await axios.put(`${API}/facilities/${editingFacility.id}`, data, { headers });
        toast.success('Facility updated successfully');
      } else {
        await axios.post(`${API}/facilities`, data, { headers });
        toast.success('Facility created successfully');
      }
      
      setShowFacilityDialog(false);
      setEditingFacility(null);
      setFacilityForm({ name: '', description: '', hourly_rate: '', amenities: '', capacity: '', available: true });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API}/events/${id}`, { headers });
      toast.success('Event deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleDeleteFacility = async (id) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API}/facilities/${id}`, { headers });
      toast.success('Facility deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete facility');
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      capacity: event.capacity,
      price: event.price,
      category: event.category
    });
    setShowEventDialog(true);
  };

  const handleEditFacility = (facility) => {
    setEditingFacility(facility);
    setFacilityForm({
      name: facility.name,
      description: facility.description,
      hourly_rate: facility.hourly_rate,
      amenities: facility.amenities.join(', '),
      capacity: facility.capacity,
      available: facility.available
    });
    setShowFacilityDialog(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }} data-testid="loading-indicator">Loading...</div>;
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand" data-testid="navbar-brand">
            <img src="https://customer-assets.emergentagent.com/job_bball-league-hub/artifacts/tglx13e4_MNASE%20Logo%20Big" alt="MNASE Basketball" style={{ height: '50px' }} />
          </Link>
          <div className="navbar-links">
            <Link to="/programs" className="navbar-link" data-testid="nav-programs-link">Programs</Link>
            <Link to="/memberships" className="navbar-link" data-testid="nav-memberships-link">Memberships</Link>
            <Link to="/dashboard" className="navbar-link" data-testid="nav-dashboard-link">Admin Dashboard</Link>
            <button onClick={handleLogout} className="navbar-btn btn-secondary" data-testid="logout-btn">Logout</button>
          </div>
        </div>
      </nav>

      <div className="dashboard-container" data-testid="admin-dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title" data-testid="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle" data-testid="dashboard-subtitle">Manage events, facilities, and bookings</p>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Total Events</div>
            <div className="stat-value" data-testid="total-events">{events.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Facilities</div>
            <div className="stat-value" data-testid="total-facilities">{facilities.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Registrations</div>
            <div className="stat-value" data-testid="total-registrations">{registrations.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Bookings</div>
            <div className="stat-value" data-testid="total-bookings">{bookings.length}</div>
          </div>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="flex flex-nowrap min-w-max">
            <TabsTrigger value="analytics" data-testid="analytics-tab">📊 Analytics</TabsTrigger>
            <TabsTrigger value="users" data-testid="users-tab">Users</TabsTrigger>
            <TabsTrigger value="roles" data-testid="roles-tab">🔐 Roles & Permissions</TabsTrigger>
            <TabsTrigger value="activity-logs" data-testid="activity-logs-tab">📋 Activity Logs</TabsTrigger>
            <TabsTrigger value="stats" data-testid="stats-tab">📊 Stats Management</TabsTrigger>
            <TabsTrigger value="affiliates" data-testid="affiliates-tab">💰 Affiliates</TabsTrigger>
            <TabsTrigger value="billing" data-testid="billing-tab">Billing</TabsTrigger>
            <TabsTrigger value="payment-plans" data-testid="payment-plans-tab">Payment Plans</TabsTrigger>
            <TabsTrigger value="calendar" data-testid="calendar-tab">Calendar</TabsTrigger>
            <TabsTrigger value="forms" data-testid="forms-tab">Form Submissions</TabsTrigger>
            <TabsTrigger value="teams" data-testid="teams-tab">Teams</TabsTrigger>
            <TabsTrigger value="events" data-testid="events-tab">Events</TabsTrigger>
            <TabsTrigger value="facilities" data-testid="facilities-tab">Facilities</TabsTrigger>
            <TabsTrigger value="registrations" data-testid="registrations-tab">Registrations</TabsTrigger>
            <TabsTrigger value="bookings" data-testid="bookings-tab">Bookings</TabsTrigger>
          </TabsList>
          </div>

          <TabsContent value="analytics" data-testid="analytics-content">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="users" data-testid="users-content">
            <UserManagement token={token} />
          </TabsContent>

          <TabsContent value="roles" data-testid="roles-content">
            <RolesManagement />
          </TabsContent>

          <TabsContent value="activity-logs" data-testid="activity-logs-content">
            <ActivityLogs />
          </TabsContent>

          <TabsContent value="stats" data-testid="stats-content">
            <StatsManagement />
          </TabsContent>

          <TabsContent value="affiliates" data-testid="affiliates-content">
            <AffiliateManagement />
          </TabsContent>

          <TabsContent value="billing" data-testid="billing-content">
            <BillingInvoices token={token} />
          </TabsContent>

          <TabsContent value="payment-plans" data-testid="payment-plans-content">
            <PaymentPlans token={token} />
          </TabsContent>


          <TabsContent value="calendar" data-testid="calendar-content">
            <CalendarManagement />
          </TabsContent>



          <TabsContent value="teams" data-testid="teams-content">
            <TeamsManagement />
          </TabsContent>

          <TabsContent value="forms" data-testid="forms-content">
            <FormSubmissions />
          </TabsContent>


          <TabsContent value="events" data-testid="events-content">
            <div style={{ marginBottom: '2rem' }}>
              <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingEvent(null); setEventForm({ title: '', description: '', date: '', time: '', location: '', capacity: '', price: '', category: '' }); }} data-testid="create-event-btn">
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="event-dialog">
                  <DialogHeader>
                    <DialogTitle>{editingEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
                    <DialogDescription>Fill in the event details</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input data-testid="event-title-input" value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} required />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea data-testid="event-description-input" value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <Label>Date</Label>
                        <Input data-testid="event-date-input" type="date" value={eventForm.date} onChange={(e) => setEventForm({...eventForm, date: e.target.value})} required />
                      </div>
                      <div>
                        <Label>Time</Label>
                        <Input data-testid="event-time-input" type="time" value={eventForm.time} onChange={(e) => setEventForm({...eventForm, time: e.target.value})} required />
                      </div>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input data-testid="event-location-input" value={eventForm.location} onChange={(e) => setEventForm({...eventForm, location: e.target.value})} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div>
                        <Label>Capacity</Label>
                        <Input data-testid="event-capacity-input" type="number" value={eventForm.capacity} onChange={(e) => setEventForm({...eventForm, capacity: e.target.value})} required />
                      </div>
                      <div>
                        <Label>Price</Label>
                        <Input data-testid="event-price-input" type="number" step="0.01" value={eventForm.price} onChange={(e) => setEventForm({...eventForm, price: e.target.value})} required />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Input data-testid="event-category-input" value={eventForm.category} onChange={(e) => setEventForm({...eventForm, category: e.target.value})} required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" data-testid="submit-event-btn">{editingEvent ? 'Update' : 'Create'} Event</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="card-grid">
              {events.map((event) => (
                <Card key={event.id} data-testid={`event-card-${event.id}`}>
                  <CardHeader>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <CardTitle data-testid={`event-title-${event.id}`}>{event.title}</CardTitle>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button size="sm" variant="outline" onClick={() => handleEditEvent(event)} data-testid={`edit-event-btn-${event.id}`}>
                          <Edit size={16} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(event.id)} data-testid={`delete-event-btn-${event.id}`}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p style={{ color: '#64748b', marginBottom: '1rem' }} data-testid={`event-description-${event.id}`}>{event.description}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                      <div><Calendar size={14} style={{ display: 'inline', marginRight: '0.5rem' }} /><span data-testid={`event-date-${event.id}`}>{event.date} at {event.time}</span></div>
                      <div><MapPin size={14} style={{ display: 'inline', marginRight: '0.5rem' }} /><span data-testid={`event-location-${event.id}`}>{event.location}</span></div>
                      <div><DollarSign size={14} style={{ display: 'inline', marginRight: '0.5rem' }} /><span data-testid={`event-price-${event.id}`}>${event.price}</span></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="facilities" data-testid="facilities-content">
            <div style={{ marginBottom: '2rem' }}>
              <Dialog open={showFacilityDialog} onOpenChange={setShowFacilityDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingFacility(null); setFacilityForm({ name: '', description: '', hourly_rate: '', amenities: '', capacity: '', available: true }); }} data-testid="create-facility-btn">
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Create Facility
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="facility-dialog">
                  <DialogHeader>
                    <DialogTitle>{editingFacility ? 'Edit Facility' : 'Create Facility'}</DialogTitle>
                    <DialogDescription>Fill in the facility details</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateFacility} className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input data-testid="facility-name-input" value={facilityForm.name} onChange={(e) => setFacilityForm({...facilityForm, name: e.target.value})} required />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea data-testid="facility-description-input" value={facilityForm.description} onChange={(e) => setFacilityForm({...facilityForm, description: e.target.value})} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <Label>Hourly Rate</Label>
                        <Input data-testid="facility-rate-input" type="number" step="0.01" value={facilityForm.hourly_rate} onChange={(e) => setFacilityForm({...facilityForm, hourly_rate: e.target.value})} required />
                      </div>
                      <div>
                        <Label>Capacity</Label>
                        <Input data-testid="facility-capacity-input" type="number" value={facilityForm.capacity} onChange={(e) => setFacilityForm({...facilityForm, capacity: e.target.value})} required />
                      </div>
                    </div>
                    <div>
                      <Label>Amenities (comma-separated)</Label>
                      <Input data-testid="facility-amenities-input" value={facilityForm.amenities} onChange={(e) => setFacilityForm({...facilityForm, amenities: e.target.value})} placeholder="Full Court, Locker Rooms, Showers" required />
                    </div>
                    <Button type="submit" className="w-full" data-testid="submit-facility-btn">{editingFacility ? 'Update' : 'Create'} Facility</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="card-grid">
              {facilities.map((facility) => (
                <Card key={facility.id} data-testid={`facility-card-${facility.id}`}>
                  <CardHeader>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <CardTitle data-testid={`facility-name-${facility.id}`}>{facility.name}</CardTitle>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button size="sm" variant="outline" onClick={() => handleEditFacility(facility)} data-testid={`edit-facility-btn-${facility.id}`}>
                          <Edit size={16} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteFacility(facility.id)} data-testid={`delete-facility-btn-${facility.id}`}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p style={{ color: '#64748b', marginBottom: '1rem' }} data-testid={`facility-description-${facility.id}`}>{facility.description}</p>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      <div><strong>Rate:</strong> <span data-testid={`facility-rate-${facility.id}`}>${facility.hourly_rate}/hour</span></div>
                      <div><strong>Capacity:</strong> <span data-testid={`facility-capacity-${facility.id}`}>{facility.capacity} people</span></div>
                      <div style={{ marginTop: '0.5rem' }}><strong>Amenities:</strong> {facility.amenities.map((a, i) => <span key={i} className="card-badge" data-testid={`facility-amenity-${facility.id}-${i}`}>{a}</span>)}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="registrations" data-testid="registrations-content">
            <RegistrationsManagement />
          </TabsContent>

          <TabsContent value="bookings" data-testid="bookings-content">
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>All Facility Bookings</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Booking ID</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Facility ID</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>User ID</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Time</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Cost</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} style={{ borderBottom: '1px solid #f3f4f6' }} data-testid={`booking-row-${booking.id}`}>
                        <td style={{ padding: '0.75rem' }} data-testid={`booking-id-${booking.id}`}>{booking.id.substring(0, 8)}...</td>
                        <td style={{ padding: '0.75rem' }} data-testid={`booking-facility-id-${booking.id}`}>{booking.facility_id.substring(0, 8)}...</td>
                        <td style={{ padding: '0.75rem' }} data-testid={`booking-user-id-${booking.id}`}>{booking.user_id.substring(0, 8)}...</td>
                        <td style={{ padding: '0.75rem' }} data-testid={`booking-date-display-${booking.id}`}>{booking.booking_date}</td>
                        <td style={{ padding: '0.75rem' }} data-testid={`booking-time-display-${booking.id}`}>{booking.start_time} - {booking.end_time}</td>
                        <td style={{ padding: '0.75rem' }} data-testid={`booking-cost-display-${booking.id}`}>${booking.total_cost}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            background: booking.payment_status === 'completed' ? '#dcfce7' : '#fef3c7',
                            color: booking.payment_status === 'completed' ? '#166534' : '#92400e'
                          }} data-testid={`booking-status-display-${booking.id}`}>
                            {booking.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AdminDashboard;