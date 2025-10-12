import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Zap } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function IndividualMemberships() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const response = await axios.get(`${API}/memberships`);
      const individualMemberships = response.data.filter(m => m.active && m.type === 'individual');
      setMemberships(individualMemberships);
    } catch (error) {
      toast.error('Failed to load memberships');
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier) => {
    const icons = {
      'Rookie': '🌱',
      'Starter': '⚡',
      'All-Star': '⭐',
      'MVP': '👑'
    };
    return icons[tier] || '🏀';
  };

  const getTierColor = (tier) => {
    const colors = {
      'Rookie': { bg: '#f3f4f6', border: '#9ca3af', text: '#374151', gradient: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' },
      'Starter': { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', gradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' },
      'All-Star': { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' },
      'MVP': { bg: '#fee2e2', border: '#dc2626', text: '#991b1b', gradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }
    };
    return colors[tier] || colors['Rookie'];
  };

  const isTopTier = (tier) => tier === 'MVP' || tier === 'All-Star';

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
        background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
        padding: '4rem 2rem',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: '700', 
            marginBottom: '1rem',
            fontFamily: 'Space Grotesk, sans-serif'
          }} data-testid="individual-memberships-title">
            Individual & Family Memberships
          </h1>
          <p style={{ fontSize: '1.3rem', opacity: 0.95, maxWidth: '800px', margin: '0 auto' }} data-testid="individual-memberships-subtitle">
            Join the MNASE family with exclusive benefits, event access, and development opportunities tailored for individual players
          </p>
        </div>
      </section>

      {/* Memberships Comparison */}
      <section style={{ padding: '4rem 2rem', background: '#f8f9ff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
              Choose Your Level
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
              Select the membership tier that fits your goals and commitment level
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }} data-testid="loading-indicator">Loading memberships...</div>
          ) : memberships.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }} data-testid="no-memberships-message">
              <p style={{ fontSize: '1.2rem', color: '#64748b' }}>No memberships available.</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
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
                      border: `2px solid ${tierColor.border}`,
                      boxShadow: topTier ? '0 8px 30px rgba(0,0,0,0.12)' : '0 4px 15px rgba(0,0,0,0.08)',
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
                        MOST POPULAR
                      </div>
                    )}
                    
                    <CardHeader style={{ paddingTop: topTier ? '2rem' : '1.5rem' }}>
                      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                          {getTierIcon(membership.tier)}
                        </div>
                        <CardTitle style={{ fontSize: '2rem', color: tierColor.text, marginBottom: '0.5rem' }} data-testid={`membership-tier-${membership.id}`}>
                          {membership.tier}
                        </CardTitle>
                        <CardDescription style={{ color: tierColor.text, opacity: 0.8 }} data-testid={`membership-description-${membership.id}`}>
                          {membership.description}
                        </CardDescription>
                      </div>
                      <div style={{ textAlign: 'center', padding: '1.5rem 0', borderTop: `2px solid ${tierColor.border}`, borderBottom: `2px solid ${tierColor.border}` }}>
                        <div style={{ fontSize: '3rem', fontWeight: '700', color: tierColor.text }} data-testid={`membership-price-${membership.id}`}>
                          ${membership.price}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: tierColor.text, opacity: 0.7, marginTop: '0.25rem' }}>per year</div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {membership.benefits.map((benefit, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                            <CheckCircle size={20} style={{ marginTop: '2px', color: tierColor.border, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.95rem', color: '#1e293b', lineHeight: '1.5' }} data-testid={`membership-benefit-${membership.id}-${idx}`}>
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
                        {token ? 'Enroll Now' : 'Login to Enroll'}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Exclusive Benefits</h3>
              <p style={{ color: '#64748b' }}>Access to member-only events, discounts, and priority registration</p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💪</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Development Focus</h3>
              <p style={{ color: '#64748b' }}>Year-round access to training sessions and skill development programs</p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Community Connection</h3>
              <p style={{ color: '#64748b' }}>Join a supportive community of players, coaches, and families</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default IndividualMemberships;
