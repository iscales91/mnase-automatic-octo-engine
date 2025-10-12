import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, DollarSign, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [bookingData, setBookingData] = useState({
    booking_date: '',
    start_time: '',
    end_time: '',
    hours: 1
  });
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const response = await axios.get(`${API}/facilities`);
      setFacilities(response.data);
    } catch (error) {
      toast.error('Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please login to book facilities');
      return;
    }

    try {
      const originUrl = window.location.origin;
      const response = await axios.post(
        `${API}/bookings/checkout`,
        {
          facility_id: selectedFacility.id,
          ...bookingData,
          origin_url: originUrl
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = response.data.checkout_url;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Booking failed');
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
            <Link to="/memberships" className="navbar-link" data-testid="nav-memberships-link">Memberships</Link>
            <Link to="/events" className="navbar-link" data-testid="nav-events-link">Events</Link>
            <Link to="/facilities" className="navbar-link" data-testid="nav-facilities-link">Facilities</Link>
            {token ? (
              <Link to="/dashboard" className="navbar-btn btn-primary" data-testid="nav-dashboard-link">Dashboard</Link>
            ) : (
              <Link to="/" className="navbar-btn btn-primary" data-testid="nav-home-link">Login</Link>
            )}
          </div>
        </div>
      </nav>

      <div style={{ padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }} data-testid="facilities-title">
            Our Facilities
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '3rem' }} data-testid="facilities-subtitle">
            Book premium basketball courts and training facilities
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }} data-testid="loading-indicator">Loading facilities...</div>
          ) : facilities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }} data-testid="no-facilities-message">
              <p style={{ fontSize: '1.2rem', color: '#64748b' }}>No facilities available at the moment.</p>
            </div>
          ) : (
            <div className="card-grid">
              {facilities.map((facility) => (
                <Card key={facility.id} data-testid={`facility-card-${facility.id}`}>
                  <CardHeader>
                    <CardTitle data-testid={`facility-name-${facility.id}`}>{facility.name}</CardTitle>
                    <CardDescription data-testid={`facility-description-${facility.id}`}>{facility.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                        <DollarSign size={18} />
                        <span data-testid={`facility-rate-${facility.id}`}>${facility.hourly_rate}/hour</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                        <Users size={18} />
                        <span data-testid={`facility-capacity-${facility.id}`}>Capacity: {facility.capacity} people</span>
                      </div>
                      <div style={{ marginTop: '1rem' }}>
                        <strong style={{ color: '#374151', marginBottom: '0.5rem', display: 'block' }}>Amenities:</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {facility.amenities.map((amenity, index) => (
                            <span key={index} className="card-badge" data-testid={`facility-amenity-${facility.id}-${index}`}>
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full" 
                          onClick={() => setSelectedFacility(facility)}
                          disabled={!facility.available}
                          data-testid={`book-facility-btn-${facility.id}`}
                        >
                          {facility.available ? 'Book Now' : 'Not Available'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent data-testid={`booking-dialog-${facility.id}`}>
                        <DialogHeader>
                          <DialogTitle>Book {selectedFacility?.name}</DialogTitle>
                          <DialogDescription>
                            ${selectedFacility?.hourly_rate}/hour - Total: ${selectedFacility?.hourly_rate * bookingData.hours}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleBook} className="space-y-4">
                          <div>
                            <Label htmlFor="booking_date">Date</Label>
                            <Input
                              id="booking_date"
                              data-testid="booking-date-input"
                              type="date"
                              value={bookingData.booking_date}
                              onChange={(e) => setBookingData({...bookingData, booking_date: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="start_time">Start Time</Label>
                            <Input
                              id="start_time"
                              data-testid="start-time-input"
                              type="time"
                              value={bookingData.start_time}
                              onChange={(e) => setBookingData({...bookingData, start_time: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="end_time">End Time</Label>
                            <Input
                              id="end_time"
                              data-testid="end-time-input"
                              type="time"
                              value={bookingData.end_time}
                              onChange={(e) => setBookingData({...bookingData, end_time: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="hours">Hours</Label>
                            <Input
                              id="hours"
                              data-testid="hours-input"
                              type="number"
                              min="1"
                              max="8"
                              value={bookingData.hours}
                              onChange={(e) => setBookingData({...bookingData, hours: parseInt(e.target.value)})}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full" data-testid="confirm-booking-btn">
                            Proceed to Payment
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Facilities;