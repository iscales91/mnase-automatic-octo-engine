import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Star } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Memberships() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const response = await axios.get(`${API}/memberships`);
      setMemberships(response.data.filter(m => m.active));
    } catch (error) {
      toast.error('Failed to load memberships');
    } finally {
      setLoading(false);
    }
  };

  const individualMemberships = memberships.filter(m => m.type === 'individual');
  const teamMemberships = memberships.filter(m => m.type === 'team');

  const getTierColor = (tier) => {
    const colors = {
      'Rookie': { bg: '#f3f4f6', border: '#9ca3af', text: '#374151' },
      'Starter': { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
      'All-Star': { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
      'MVP': { bg: '#fee2e2', border: '#dc2626', text: '#991b1b' },
      'Recreational': { bg: '#f3f4f6', border: '#9ca3af', text: '#374151' },
      'Competitive': { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
      'Elite': { bg: '#fee2e2', border: '#dc2626', text: '#991b1b' }
    };
    return colors[tier] || colors['Rookie'];
  };

  const MembershipCard = ({ membership }) => {
    const tierColor = getTierColor(membership.tier);
    const isTopTier = membership.tier === 'MVP' || membership.tier === 'Elite';

    return (
      <Card 
        key={membership.id} 
        data-testid={`membership-card-${membership.id}`}
        style={{ 
          borderTop: `4px solid ${tierColor.border}`,
          position: 'relative',
          background: isTopTier ? 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)' : 'white'
        }}
      >
        {isTopTier && (
          <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
            <Star size={24} style={{ color: '#dc2626', fill: '#dc2626' }} />
          </div>
        )}
        <CardHeader>
          <CardTitle data-testid={`membership-tier-${membership.id}`}>
            {membership.tier}
          </CardTitle>
          <CardDescription data-testid={`membership-description-${membership.id}`}>
            {membership.description}
          </CardDescription>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b' }} data-testid={`membership-price-${membership.id}`}>
              ${membership.price}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>per year</div>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <strong style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Benefits:</strong>
            {membership.benefits.map((benefit, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                <CheckCircle size={18} style={{ marginTop: '2px', color: tierColor.border, flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', color: '#475569' }} data-testid={`membership-benefit-${membership.id}-${idx}`}>
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            style={{ background: tierColor.border }}
            data-testid={`join-membership-btn-${membership.id}`}
          >
            {token ? 'Enroll Now' : 'Login to Enroll'}
          </Button>
        </CardFooter>
      </Card>
    );
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
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }} data-testid="memberships-title">
            MNASE Memberships
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '3rem' }} data-testid="memberships-subtitle">
            Join the MNASE family with exclusive benefits, event access, and development opportunities
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }} data-testid="loading-indicator">Loading memberships...</div>
          ) : (
            <Tabs defaultValue="individual" className="w-full">
              <TabsList className="grid w-full grid-cols-2" style={{ maxWidth: '400px', margin: '0 auto 3rem' }}>
                <TabsTrigger value="individual" data-testid="individual-tab">Individual</TabsTrigger>
                <TabsTrigger value="team" data-testid="team-tab">Team</TabsTrigger>
              </TabsList>
              
              <TabsContent value="individual" data-testid="individual-content">
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Individual Memberships</h2>
                  <p style={{ color: '#64748b' }}>Perfect for players seeking regular access to MNASE programs and events</p>
                </div>
                {individualMemberships.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ fontSize: '1.2rem', color: '#64748b' }}>No individual memberships available.</p>
                  </div>
                ) : (
                  <div className="card-grid">
                    {individualMemberships.map(membership => (
                      <MembershipCard key={membership.id} membership={membership} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="team" data-testid="team-content">
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Team Memberships</h2>
                  <p style={{ color: '#64748b' }}>Comprehensive packages for teams including insurance, uniforms, and tournament access</p>
                </div>
                {teamMemberships.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ fontSize: '1.2rem', color: '#64748b' }}>No team memberships available.</p>
                  </div>
                ) : (
                  <div className="card-grid">
                    {teamMemberships.map(membership => (
                      <MembershipCard key={membership.id} membership={membership} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}

export default Memberships;