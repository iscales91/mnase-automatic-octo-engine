import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, Trophy, Shield } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function TeamMemberships() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const response = await axios.get(`${API}/memberships`);
      const teamMemberships = response.data.filter(m => m.active && m.type === 'team');
      setMemberships(teamMemberships);
    } catch (error) {
      toast.error('Failed to load memberships');
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier) => {
    const icons = {
      'Recreational': <Users size={40} />,
      'Competitive': <Trophy size={40} />,
      'Elite': <Shield size={40} />
    };
    return icons[tier] || <Users size={40} />;
  };

  const getTierColor = (tier) => {
    const colors = {
      'Recreational': { bg: '#f0fdf4', border: '#22c55e', text: '#166534', gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' },
      'Competitive': { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' },
      'Elite': { bg: '#fef2f2', border: '#dc2626', text: '#991b1b', gradient: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' }
    };
    return colors[tier] || colors['Recreational'];
  };

  const isTopTier = (tier) => tier === 'Elite';

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
                <Link to="/memberships/individual" data-testid="nav-individual-memberships-link">Individual/Family</Link>
                <Link to="/memberships/team" data-testid="nav-team-memberships-link">Team/Group</Link>
              </div>
            </div>
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Mentality Academy ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/camps" data-testid="nav-camps-link">Camps</Link>
                <Link to="/clinics" data-testid="nav-clinics-link">Clinics</Link>
                <Link to="/workshops" data-testid="nav-workshops-link">Workshops</Link>
              </div>
            </div>
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

      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        padding: '4rem 2rem',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: '700', 
            marginBottom: '1rem',
            fontFamily: 'Space Grotesk, sans-serif'
          }} data-testid="team-memberships-title">
            Team & Group Memberships
          </h1>
          <p style={{ fontSize: '1.3rem', opacity: 0.95, maxWidth: '800px', margin: '0 auto' }} data-testid="team-memberships-subtitle">
            Comprehensive packages for teams including insurance, uniforms, tournament access, and dedicated support
          </p>
        </div>
      </section>

      {/* Memberships Grid */}
      <section style={{ padding: '4rem 2rem', background: '#f8f9ff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
              Team Packages
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
              All packages include base insurance ($110) plus comprehensive team benefits
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }} data-testid="loading-indicator">Loading memberships...</div>
          ) : memberships.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }} data-testid="no-memberships-message">
              <p style={{ fontSize: '1.2rem', color: '#64748b' }}>No team memberships available.</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '2rem',
              alignItems: 'stretch'
            }}>
              {memberships.map((membership) => {
                const tierColor = getTierColor(membership.tier);
                const topTier = isTopTier(membership.tier);
                
                return (
                  <Card 
                    key={membership.id} 
                    data-testid={`membership-card-${membership.id}`}
                    style={{ 
                      position: 'relative',
                      background: tierColor.gradient,
                      border: `3px solid ${tierColor.border}`,
                      boxShadow: topTier ? '0 12px 40px rgba(0,0,0,0.15)' : '0 6px 25px rgba(0,0,0,0.1)',
                      transform: topTier ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.3s'
                    }}
                  >
                    {topTier && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '-15px', 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        background: tierColor.border,
                        color: 'white',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '20px',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}>
                        PREMIUM PACKAGE
                      </div>
                    )}
                    
                    <CardHeader style={{ paddingTop: topTier ? '2rem' : '1.5rem' }}>
                      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <div style={{ color: tierColor.border, marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                          {getTierIcon(membership.tier)}
                        </div>
                        <CardTitle style={{ fontSize: '2.2rem', color: tierColor.text, marginBottom: '0.5rem' }} data-testid={`membership-tier-${membership.id}`}>
                          {membership.tier}
                        </CardTitle>
                        <CardDescription style={{ color: tierColor.text, opacity: 0.8, fontSize: '1rem' }} data-testid={`membership-description-${membership.id}`}>
                          {membership.description}
                        </CardDescription>
                      </div>
                      <div style={{ textAlign: 'center', padding: '1.5rem 0', borderTop: `2px solid ${tierColor.border}`, borderBottom: `2px solid ${tierColor.border}` }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: '700', color: tierColor.text }} data-testid={`membership-price-${membership.id}`}>
                          ${membership.price}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: tierColor.text, opacity: 0.7, marginTop: '0.25rem' }}>per season</div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {membership.benefits.map((benefit, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                            <CheckCircle size={22} style={{ marginTop: '2px', color: tierColor.border, flexShrink: 0 }} />
                            <span style={{ fontSize: '1rem', color: '#1e293b', lineHeight: '1.5', fontWeight: '500' }} data-testid={`membership-benefit-${membership.id}-${idx}`}>
                              {benefit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    
                    <CardFooter style={{ paddingTop: '1.5rem' }}>
                      <Button 
                        className="w-full" 
                        style={{ 
                          background: tierColor.border,
                          fontSize: '1.1rem',
                          padding: '1.25rem',
                          fontWeight: '600'
                        }}
                        data-testid={`join-membership-btn-${membership.id}`}
                      >
                        {token ? 'Enroll Team' : 'Login to Enroll'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Additional Info Section */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem', color: '#1e293b' }}>
            Why Choose MNASE Team Membership?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Insurance Included</h3>
              <p style={{ color: '#64748b' }}>Comprehensive coverage for all team members during MNASE activities</p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👕</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Uniforms & Gear</h3>
              <p style={{ color: '#64748b' }}>Professional team uniforms and coaches' equipment packages included</p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏟️</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Facility Access</h3>
              <p style={{ color: '#64748b' }}>Priority scheduling and access to MNASE basketball facilities</p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Tournament Entry</h3>
              <p style={{ color: '#64748b' }}>Discounted entry fees and hosting credits for MNASE tournaments</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TeamMemberships;
