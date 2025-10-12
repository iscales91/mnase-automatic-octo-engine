import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function RegistrationSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');
  const [pollCount, setPollCount] = useState(0);
  const sessionId = searchParams.get('session_id');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!sessionId || !token) {
      navigate('/');
      return;
    }
    pollPaymentStatus();
  }, [sessionId, token, navigate]);

  const pollPaymentStatus = async () => {
    if (pollCount >= 5) {
      setStatus('timeout');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API}/registrations/status/${sessionId}`, { headers });
      
      if (response.data.payment_status === 'paid') {
        setStatus('success');
        toast.success('Registration confirmed!');
      } else if (response.data.status === 'expired') {
        setStatus('failed');
        toast.error('Payment session expired');
      } else {
        setPollCount(prev => prev + 1);
        setTimeout(pollPaymentStatus, 2000);
      }
    } catch (error) {
      setStatus('error');
      toast.error('Failed to verify payment');
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand" data-testid="navbar-brand">MNASE Basketball</Link>
          <div className="navbar-links">
            <Link to="/dashboard" className="navbar-btn btn-primary" data-testid="nav-dashboard-link">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <Card style={{ maxWidth: '500px', width: '100%' }} data-testid="success-card">
          <CardHeader>
            <CardTitle style={{ textAlign: 'center', fontSize: '2rem' }} data-testid="success-title">
              {status === 'checking' && 'Verifying Payment...'}
              {status === 'success' && 'Registration Confirmed!'}
              {status === 'failed' && 'Payment Failed'}
              {status === 'timeout' && 'Verification Timeout'}
              {status === 'error' && 'Verification Error'}
            </CardTitle>
          </CardHeader>
          <CardContent style={{ textAlign: 'center' }}>
            {status === 'checking' && (
              <div data-testid="checking-status">
                <Loader2 className="animate-spin" size={64} style={{ margin: '2rem auto', color: '#3b82f6' }} />
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>Please wait while we confirm your payment...</p>
              </div>
            )}
            {status === 'success' && (
              <div data-testid="success-status">
                <CheckCircle size={64} style={{ margin: '2rem auto', color: '#10b981' }} />
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>Your event registration has been confirmed. Check your dashboard for details.</p>
                <Button asChild data-testid="view-registrations-btn">
                  <Link to="/dashboard">View My Registrations</Link>
                </Button>
              </div>
            )}
            {(status === 'failed' || status === 'timeout' || status === 'error') && (
              <div data-testid="failed-status">
                <p style={{ color: '#ef4444', marginBottom: '2rem' }}>There was an issue confirming your payment. Please contact support if the amount was charged.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <Button asChild variant="outline" data-testid="back-to-events-btn">
                    <Link to="/events">Back to Events</Link>
                  </Button>
                  <Button asChild data-testid="contact-support-btn">
                    <Link to="/dashboard">Contact Support</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RegistrationSuccess;