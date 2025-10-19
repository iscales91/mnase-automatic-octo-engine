import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Clock, DollarSign, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { canAccessMemberDashboard } from '@/utils/roleUtils';
import RestrictedAccess from '@/components/RestrictedAccess';
import FamilyDashboard from '@/components/FamilyDashboard';
import AffiliateEarningsDashboard from '@/components/AffiliateEarningsDashboard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function MemberDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [youthRegistrations, setYouthRegistrations] = useState([]);
  const [adultRegistrations, setAdultRegistrations] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

  // Check authentication
  if (!token || !canAccessMemberDashboard(storedUser)) {
    return (
      <RestrictedAccess 
        message="You need to be logged in to access the Member Dashboard."
        requiredRole="Member (logged in user)"
      />
    );
  }

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
      
      const [userRes, regRes, youthRegRes, adultRegRes, calendarRes, bookRes, teamsRes] = await Promise.all([
        axios.get(`${API}/auth/me`, { headers }),
        axios.get(`${API}/registrations`, { headers }),
        axios.get(`${API}/enhanced-registrations`, { headers }),
        axios.get(`${API}/adult-registrations`, { headers }),
        axios.get(`${API}/calendar-events`),
        axios.get(`${API}/bookings`, { headers }),
        axios.get(`${API}/teams`)
      ]);

      setUser(userRes.data);
      setRegistrations(regRes.data);
      setYouthRegistrations(youthRegRes.data);
      setAdultRegistrations(adultRegRes.data);
      setBookings(bookRes.data);
      
      // Filter upcoming events
      const today = new Date();
      const upcoming = calendarRes.data
        .filter(event => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
      setUpcomingEvents(upcoming);
      
      // Find teams user is on
      const allRegistrationIds = [...youthRegRes.data.map(r => r.id), ...adultRegRes.data.map(r => r.id)];
      const userTeams = teamsRes.data.filter(team => 
        team.players?.some(player => allRegistrationIds.includes(player.registration_id))
      );
      setMyTeams(userTeams);
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

  const handleYouthPayment = async (registrationId) => {
    try {
      const originUrl = window.location.origin;
      const response = await axios.post(
        `${API}/enhanced-registrations/${registrationId}/checkout`,
        { origin_url: originUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to initiate payment');
    }
  };

  const handleAdultPayment = async (registrationId) => {
    try {
      const originUrl = window.location.origin;
      const response = await axios.post(
        `${API}/adult-registrations/${registrationId}/checkout`,
        { origin_url: originUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to initiate payment');
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'approved') return <CheckCircle size={20} style={{ color: '#10b981' }} />;
    if (status === 'pending') return <AlertCircle size={20} style={{ color: '#eab308' }} />;
    return <XCircle size={20} style={{ color: '#ef4444' }} />;
  };

  const getStatusColor = (status) => {
    if (status === 'approved') return { background: '#dcfce7', color: '#166534' };
    if (status === 'pending') return { background: '#fef3c7', color: '#854d0e' };
    return { background: '#fee2e2', color: '#991b1b' };
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <img src="https://customer-assets.emergentagent.com/job_bball-league-hub/artifacts/tglx13e4_MNASE%20Logo%20Big" alt="MNASE Basketball" style={{ height: '50px' }} />
          </Link>
          <div className="navbar-links">
            <Link to="/programs" className="navbar-link">Programs</Link>
            <Link to="/events" className="navbar-link">Events</Link>
            <Link to="/facilities" className="navbar-link">Facilities</Link>
            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
            <button onClick={handleLogout} className="navbar-btn btn-secondary">Logout</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
            Welcome, {user?.name}!
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#64748b' }}>
            Manage your registrations, teams, and upcoming activities
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e8eeff' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Program Registrations</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>
              {youthRegistrations.length + adultRegistrations.length}
            </div>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e8eeff' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>My Teams</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>
              {myTeams.length}
            </div>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e8eeff' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Upcoming Events</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>
              {upcomingEvents.length}
            </div>
          </div>
          <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #e8eeff' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Facility Bookings</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }}>
              {bookings.length}
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="registrations" className="w-full">
          <TabsList style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap' }}>
            <TabsTrigger value="registrations">My Registrations</TabsTrigger>
            <TabsTrigger value="family">Family & Children</TabsTrigger>
            <TabsTrigger value="teams">My Teams</TabsTrigger>
            <TabsTrigger value="schedule">Upcoming Schedule</TabsTrigger>
            <TabsTrigger value="bookings">Facility Bookings</TabsTrigger>
          </TabsList>

          {/* Family Dashboard Tab */}
          <TabsContent value="family">
            <FamilyDashboard />
          </TabsContent>

          {/* Registrations Tab */}
          <TabsContent value="registrations">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {youthRegistrations.length === 0 && adultRegistrations.length === 0 ? (
                <Card>
                  <CardContent style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '1.5rem' }}>
                      No program registrations yet
                    </p>
                    <Link to="/program-registration">
                      <Button>Register for a Program</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {youthRegistrations.map((reg) => (
                    <Card key={reg.id} style={{ border: '2px solid #e8eeff' }}>
                      <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div>
                            <CardTitle>Youth Registration - {reg.athlete_first_name} {reg.athlete_last_name}</CardTitle>
                            <CardDescription>Registration ID: {reg.id}</CardDescription>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            ...getStatusColor(reg.status)
                          }}>
                            {getStatusIcon(reg.status)}
                            <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{reg.status}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Age Group</div>
                            <div style={{ fontWeight: '600' }}>{reg.athlete_grade}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Skill Level</div>
                            <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{reg.skill_level}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Position</div>
                            <div style={{ fontWeight: '600' }}>{reg.position || 'Not specified'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Registered On</div>
                            <div style={{ fontWeight: '600' }}>{new Date(reg.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Payment Status</div>
                            <div style={{ fontWeight: '600', textTransform: 'capitalize', color: reg.payment_status === 'paid' ? '#10b981' : '#eab308' }}>
                              {reg.payment_status === 'paid' ? 'Paid' : reg.payment_status === 'pending_payment' ? 'Pending' : 'Unpaid'}
                            </div>
                            {reg.registration_fee && (
                              <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>
                                Registration Fee: ${reg.registration_fee}
                              </div>
                            )}
                          </div>
                          {reg.status === 'approved' && reg.payment_status !== 'paid' && (
                            <Button onClick={() => handleYouthPayment(reg.id)}>
                              <DollarSign size={16} style={{ marginRight: '0.5rem' }} />
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {adultRegistrations.map((reg) => (
                    <Card key={reg.id} style={{ border: '2px solid #e8eeff' }}>
                      <CardHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div>
                            <CardTitle>Adult Registration - {reg.participant_name}</CardTitle>
                            <CardDescription>Registration ID: {reg.id}</CardDescription>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            ...getStatusColor(reg.status)
                          }}>
                            {getStatusIcon(reg.status)}
                            <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{reg.status}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Skill Level</div>
                            <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{reg.skill_level}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Position</div>
                            <div style={{ fontWeight: '600' }}>{reg.position || 'Not specified'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Email</div>
                            <div style={{ fontWeight: '600' }}>{reg.participant_email}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Registered On</div>
                            <div style={{ fontWeight: '600' }}>{new Date(reg.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Payment Status</div>
                            <div style={{ fontWeight: '600', textTransform: 'capitalize', color: reg.payment_status === 'paid' ? '#10b981' : '#eab308' }}>
                              {reg.payment_status === 'paid' ? 'Paid' : reg.payment_status === 'pending_payment' ? 'Pending' : 'Unpaid'}
                            </div>
                            {reg.registration_fee && (
                              <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>
                                Registration Fee: ${reg.registration_fee}
                              </div>
                            )}
                          </div>
                          {reg.status === 'approved' && reg.payment_status !== 'paid' && (
                            <Button onClick={() => handleAdultPayment(reg.id)}>
                              <DollarSign size={16} style={{ marginRight: '0.5rem' }} />
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams">
            {myTeams.length === 0 ? (
              <Card>
                <CardContent style={{ padding: '3rem', textAlign: 'center' }}>
                  <Users size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
                  <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
                    You haven't been assigned to a team yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {myTeams.map((team) => (
                  <Card key={team.id} style={{ border: '2px solid #e8eeff' }}>
                    <CardHeader>
                      <CardTitle style={{ fontSize: '1.5rem' }}>{team.name}</CardTitle>
                      <CardDescription>{team.division} • {team.season}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Coach</div>
                          <div style={{ fontWeight: '600' }}>{team.coach_name}</div>
                        </div>
                        {team.practice_schedule && (
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Practice Schedule</div>
                            <div style={{ fontWeight: '600' }}>{team.practice_schedule}</div>
                          </div>
                        )}
                        {team.home_venue && (
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Home Venue</div>
                            <div style={{ fontWeight: '600' }}>{team.home_venue}</div>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Roster Size</div>
                          <div style={{ fontWeight: '600' }}>{team.players?.length || 0} / {team.max_roster_size}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            {upcomingEvents.length === 0 ? (
              <Card>
                <CardContent style={{ padding: '3rem', textAlign: 'center' }}>
                  <Calendar size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
                  <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
                    No upcoming events scheduled
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {upcomingEvents.map((event) => (
                  <Card key={event.id} style={{ border: '2px solid #e8eeff' }}>
                    <CardContent style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            {event.title}
                          </h3>
                          {event.description && (
                            <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>{event.description}</p>
                          )}
                          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                            <span>📅 {event.date}</span>
                            {event.time && <span>🕐 {event.time}</span>}
                            {event.location && <span>📍 {event.location}</span>}
                          </div>
                        </div>
                        <div style={{
                          padding: '0.5rem 1rem',
                          background: '#dcfce7',
                          color: '#166534',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {event.type}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab - Keep existing */}
          <TabsContent value="bookings">
            {bookings.length === 0 ? (
              <Card>
                <CardContent style={{ padding: '3rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '1.5rem' }}>
                    No facility bookings yet
                  </p>
                  <Link to="/facilities">
                    <Button>Book a Facility</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Booking ID: {booking.id}</h3>
                          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                            <span>📅 {booking.date}</span>
                            <span>🕐 {booking.start_time} - {booking.end_time}</span>
                            <span>💵 ${booking.amount}</span>
                          </div>
                        </div>
                        <div style={{
                          padding: '0.5rem 1rem',
                          ...getStatusColor(booking.payment_status)
                        }}>
                          {booking.payment_status}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default MemberDashboard;