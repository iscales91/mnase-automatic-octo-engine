import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, MapPin, Users, DollarSign } from 'lucide-react';
import Calendar from '@/components/Calendar';
import AdvancedCalendar from '@/components/AdvancedCalendar';
import { getCategoryBadgeStyle } from '@/utils/eventCategories';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`);
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId, price) => {
    if (!token) {
      toast.error('Please login to register for events');
      return;
    }

    try {
      const originUrl = window.location.origin;
      const response = await axios.post(
        `${API}/registrations/checkout?event_id=${eventId}`,
        { origin_url: originUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = response.data.checkout_url;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

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
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Memberships ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/memberships/individual">Individual/Family</Link>
                <Link to="/memberships/team">Team/Group</Link>
              </div>
            </div>
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Mentality Academy ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/camps">Camps</Link>
                <Link to="/clinics">Clinics</Link>
                <Link to="/workshops">Workshops</Link>
              </div>
            </div>
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Events ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/calendar">Calendar</Link>
                <Link to="/shoot-n-hoops">Shoot N HOOPS</Link>
                <Link to="/summer-sizzle">Summer Sizzle Circuit</Link>
                <Link to="/winter-wars">Winter Wars Circuit</Link>
                <Link to="/media-gallery">Media/Video Gallery</Link>
              </div>
            </div>
            <Link to="/facilities" className="navbar-link" data-testid="nav-facilities-link">Facilities</Link>
            {token ? (
              <Link to="/dashboard" className="navbar-btn btn-primary" data-testid="nav-dashboard-link">Dashboard</Link>
            ) : (
              <Link to="/" className="navbar-btn btn-primary" data-testid="nav-home-link">Login</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
        padding: '4rem 2rem 3rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '1rem',
            fontFamily: 'Space Grotesk, sans-serif'
          }} data-testid="events-title">
            Events & Calendar
          </h1>
          <p style={{ fontSize: '1.3rem', color: '#94a3b8' }} data-testid="events-subtitle">
            Browse upcoming events, programs, and activities
          </p>
        </div>
      </section>

      <div style={{ padding: '3rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              background: '#f8f9ff',
              padding: '0.5rem',
              borderRadius: '12px',
              marginBottom: '2rem'
            }}>
              <TabsTrigger value="calendar" data-testid="calendar-tab" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
                📅 Calendar View
              </TabsTrigger>
              <TabsTrigger value="list" data-testid="list-tab" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
                📋 List View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" data-testid="calendar-content">
              <AdvancedCalendar />
            </TabsContent>

            <TabsContent value="list" data-testid="list-content">{loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }} data-testid="loading-indicator">Loading events...</div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }} data-testid="no-events-message">
              <p style={{ fontSize: '1.2rem', color: '#64748b' }}>No events available at the moment.</p>
            </div>
          ) : (
            <div className="card-grid">
              {events.map((event) => (
                <Card key={event.id} data-testid={`event-card-${event.id}`}>
                  <CardHeader>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <CardTitle data-testid={`event-title-${event.id}`}>{event.title}</CardTitle>
                      <span className="card-badge" data-testid={`event-category-${event.id}`}>{event.category}</span>
                    </div>
                    <CardDescription data-testid={`event-description-${event.id}`}>{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                        <CalendarIcon size={18} />
                        <span data-testid={`event-date-${event.id}`}>{event.date} at {event.time}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                        <MapPin size={18} />
                        <span data-testid={`event-location-${event.id}`}>{event.location}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                        <Users size={18} />
                        <span data-testid={`event-capacity-${event.id}`}>Capacity: {event.capacity} players</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontWeight: '600', fontSize: '1.1rem' }}>
                        <DollarSign size={18} />
                        <span data-testid={`event-price-${event.id}`}>${event.price}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => handleRegister(event.id, event.price)}
                      data-testid={`register-btn-${event.id}`}
                    >
                      Register Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}</TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default Events;