import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Award, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AffiliateApplication() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [formData, setFormData] = useState({
    role_type: 'athlete',
    sport_experience: '',
    social_media_links: ['', '', ''],
    motivation: ''
  });
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    checkApplicationStatus();
  }, [token, navigate]);

  const checkApplicationStatus = async () => {
    try {
      const response = await axios.get(`${API}/affiliates/my-application`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplicationStatus(response.data);
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const socialLinks = formData.social_media_links.filter(link => link.trim() !== '');
      
      const response = await axios.post(`${API}/affiliates/apply`, {
        ...formData,
        social_media_links: socialLinks
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Application submitted successfully!');
      setApplicationStatus({ status: 'pending' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (index, value) => {
    const newLinks = [...formData.social_media_links];
    newLinks[index] = value;
    setFormData(prev => ({ ...prev, social_media_links: newLinks }));
  };

  if (applicationStatus?.status === 'pending') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '4rem' }}>
          <Card>
            <CardHeader style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Award size={40} color="#d97706" />
                </div>
              </div>
              <CardTitle style={{ fontSize: '2rem', color: '#1e293b' }}>Application Pending</CardTitle>
              <CardDescription style={{ fontSize: '1.1rem' }}>
                Your affiliate application is under review
              </CardDescription>
            </CardHeader>
            <CardContent style={{ textAlign: 'center', paddingBottom: '3rem' }}>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                We're reviewing your application. You'll receive an email notification once it's been processed.
                This typically takes 1-3 business days.
              </p>
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (applicationStatus?.status === 'approved') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '4rem' }}>
          <Card>
            <CardHeader style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle size={40} color="#16a34a" />
                </div>
              </div>
              <CardTitle style={{ fontSize: '2rem', color: '#1e293b' }}>You're an Affiliate!</CardTitle>
              <CardDescription style={{ fontSize: '1.1rem' }}>
                Your affiliate account is active
              </CardDescription>
            </CardHeader>
            <CardContent style={{ textAlign: 'center', paddingBottom: '3rem' }}>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                Congratulations! You can now start earning commissions on ticket sales.
              </p>
              <Link to="/dashboard">
                <Button>View Affiliate Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (applicationStatus?.status === 'rejected') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '4rem' }}>
          <Card>
            <CardHeader style={{ textAlign: 'center' }}>
              <CardTitle style={{ fontSize: '2rem', color: '#1e293b' }}>Application Status</CardTitle>
            </CardHeader>
            <CardContent style={{ textAlign: 'center', paddingBottom: '3rem' }}>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                Unfortunately, your affiliate application was not approved at this time.
              </p>
              {applicationStatus.rejection_reason && (
                <p style={{ color: '#64748b', marginBottom: '2rem', fontStyle: 'italic' }}>
                  Reason: {applicationStatus.rejection_reason}
                </p>
              )}
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>
          Become a MNASE Affiliate
        </h1>
        <p style={{ fontSize: '1.3rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto' }}>
          Earn 15% commission on every ticket sale through your unique referral link
        </p>
      </div>

      {/* Benefits Section */}
      <div style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          <Card>
            <CardContent style={{ padding: '2rem', textAlign: 'center' }}>
              <DollarSign size={40} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>15% Commission</h3>
              <p style={{ color: '#64748b' }}>Earn on every ticket sale made through your referral link</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent style={{ padding: '2rem', textAlign: 'center' }}>
              <TrendingUp size={40} color="#10b981" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Track Earnings</h3>
              <p style={{ color: '#64748b' }}>Real-time dashboard to monitor your sales and commissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent style={{ padding: '2rem', textAlign: 'center' }}>
              <Users size={40} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Monthly Payouts</h3>
              <p style={{ color: '#64748b' }}>Automatic payouts on the 1st of every month via Stripe</p>
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
          <CardHeader>
            <CardTitle style={{ fontSize: '1.8rem' }}>Affiliate Application</CardTitle>
            <CardDescription>Tell us about your experience and why you'd be a great affiliate</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <Label htmlFor="role_type">I am a *</Label>
                <select
                  id="role_type"
                  value={formData.role_type}
                  onChange={(e) => handleInputChange('role_type', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                >
                  <option value="athlete">Athlete</option>
                  <option value="coach">Coach</option>
                </select>
              </div>

              <div>
                <Label htmlFor="sport_experience">Basketball Experience *</Label>
                <Textarea
                  id="sport_experience"
                  placeholder="Tell us about your basketball experience, achievements, years playing/coaching, etc."
                  value={formData.sport_experience}
                  onChange={(e) => handleInputChange('sport_experience', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Social Media Links (Optional)</Label>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  Share your social media profiles to help us understand your reach
                </p>
                {formData.social_media_links.map((link, index) => (
                  <Input
                    key={index}
                    type="url"
                    placeholder={`Social media link ${index + 1} (Instagram, Twitter, Facebook, etc.)`}
                    value={link}
                    onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                    style={{ marginBottom: '0.5rem' }}
                  />
                ))}
              </div>

              <div>
                <Label htmlFor="motivation">Why do you want to become an affiliate? *</Label>
                <Textarea
                  id="motivation"
                  placeholder="Tell us your motivation for joining the MNASE affiliate program"
                  value={formData.motivation}
                  onChange={(e) => handleInputChange('motivation', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div style={{
                background: '#f1f5f9',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#475569'
              }}>
                <strong>Note:</strong> Your application will be reviewed by our team. You'll receive an email notification
                once your application has been processed (typically 1-3 business days).
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Link to="/dashboard">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AffiliateApplication;
