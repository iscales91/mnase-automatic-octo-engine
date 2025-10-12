import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Clock, DollarSign } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function MemberDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState({});
  const [facilities, setFacilities] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [userRes, regRes, bookRes, eventsRes, facRes] = await Promise.all([
        axios.get(`${API}/auth/me`, { headers }),
        axios.get(`${API}/registrations`, { headers }),
        axios.get(`${API}/bookings`, { headers }),
        axios.get(`${API}/events`),
        axios.get(`${API}/facilities`)
      ]);

      setUser(userRes.data);
      setRegistrations(regRes.data);
      setBookings(bookRes.data);
      
      const eventsMap = {};
      eventsRes.data.forEach(event => {
        eventsMap[event.id] = event;
      });
      setEvents(eventsMap);
      
      const facMap = {};
      facRes.data.forEach(fac => {
        facMap[fac.id] = fac;
      });
      setFacilities(facMap);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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
          <Link to="/" className="navbar-brand" data-testid="navbar-brand">MNASE Basketball</Link>
          <div className="navbar-links">
            <Link to="/events" className="navbar-link" data-testid="nav-events-link">Events</Link>
            <Link to="/facilities" className="navbar-link" data-testid="nav-facilities-link">Facilities</Link>
            <Link to="/dashboard" className="navbar-link" data-testid="nav-dashboard-link">Dashboard</Link>
            <button onClick={handleLogout} className="navbar-btn btn-secondary" data-testid="logout-btn">Logout</button>
          </div>
        </div>
      </nav>

      <div className="dashboard-container" data-testid="member-dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title" data-testid="dashboard-title">Welcome, {user?.name}!</h1>
          <p className="dashboard-subtitle" data-testid="dashboard-subtitle">Manage your registrations and bookings</p>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Total Registrations</div>
            <div className="stat-value" data-testid="total-registrations">{registrations.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Bookings</div>
            <div className="stat-value" data-testid="total-bookings">{bookings.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed Payments</div>
            <div className="stat-value" data-testid="completed-payments">
              {registrations.filter(r => r.payment_status === 'completed').length + 
               bookings.filter(b => b.payment_status === 'completed').length}
            </div>
          </div>
        </div>

        <Tabs defaultValue="registrations" className="w-full">
          <TabsList>
            <TabsTrigger value="registrations" data-testid="registrations-tab">Event Registrations</TabsTrigger>
            <TabsTrigger value="bookings" data-testid="bookings-tab">Facility Bookings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="registrations" data-testid="registrations-content">
            <div className="card-grid">
              {registrations.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }} data-testid="no-registrations-message">
                  No event registrations yet. <Link to="/events" style={{ color: '#3b82f6' }}>Browse events</Link>
                </p>
              ) : (
                registrations.map((reg) => {
                  const event = events[reg.event_id];
                  if (!event) return null;
                  return (
                    <Card key={reg.id} data-testid={`registration-card-${reg.id}`}>
                      <CardHeader>
                        <CardTitle data-testid={`registration-event-title-${reg.id}`}>{event.title}</CardTitle>
                        <CardDescription>
                          <span 
                            style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              background: reg.payment_status === 'completed' ? '#dcfce7' : '#fef3c7',
                              color: reg.payment_status === 'completed' ? '#166534' : '#92400e'
                            }}
                            data-testid={`registration-status-${reg.id}`}
                          >
                            {reg.payment_status === 'completed' ? 'Confirmed' : 'Pending'}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem', color: '#64748b' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={16} />
                            <span data-testid={`registration-event-date-${reg.id}`}>{event.date} at {event.time}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={16} />
                            <span data-testid={`registration-event-location-${reg.id}`}>{event.location}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <DollarSign size={16} />
                            <span data-testid={`registration-event-price-${reg.id}`}>${event.price}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="bookings" data-testid="bookings-content">
            <div className="card-grid">
              {bookings.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }} data-testid="no-bookings-message">
                  No facility bookings yet. <Link to="/facilities" style={{ color: '#3b82f6' }}>Browse facilities</Link>
                </p>
              ) : (
                bookings.map((booking) => {
                  const facility = facilities[booking.facility_id];
                  if (!facility) return null;
                  return (
                    <Card key={booking.id} data-testid={`booking-card-${booking.id}`}>
                      <CardHeader>
                        <CardTitle data-testid={`booking-facility-name-${booking.id}`}>{facility.name}</CardTitle>
                        <CardDescription>
                          <span 
                            style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              background: booking.payment_status === 'completed' ? '#dcfce7' : '#fef3c7',
                              color: booking.payment_status === 'completed' ? '#166534' : '#92400e'
                            }}
                            data-testid={`booking-status-${booking.id}`}
                          >
                            {booking.payment_status === 'completed' ? 'Confirmed' : 'Pending'}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem', color: '#64748b' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={16} />
                            <span data-testid={`booking-date-${booking.id}`}>{booking.booking_date}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={16} />
                            <span data-testid={`booking-time-${booking.id}`}>{booking.start_time} - {booking.end_time} ({booking.hours}h)</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <DollarSign size={16} />
                            <span data-testid={`booking-cost-${booking.id}`}>${booking.total_cost}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default MemberDashboard;