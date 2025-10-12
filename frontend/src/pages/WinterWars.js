import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Trophy, Snowflake, CheckCircle } from 'lucide-react';

function WinterWars() {
  const token = localStorage.getItem('token');

  const venues = [
    'Phalen Recreation Center',
    'Linwood Recreation Center',
    'Merriam Park Recreation Center',
    'Arlington Hills Recreation Center',
    'MLK Recreation Center'
  ];

  const divisions = [
    '4th Grade',
    '5th Grade',
    '6th Grade',
    '7th Grade',
    '8th Grade'
  ];

  return (
    <div>
      {/* Navbar - Same as other pages */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <img src="https://customer-assets.emergentagent.com/job_bball-league-hub/artifacts/tglx13e4_MNASE%20Logo%20Big" alt="MNASE Basketball" style={{ height: '50px' }} />
          </Link>
          <div className="navbar-links">
            <Link to="/programs" className="navbar-link">Programs</Link>
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
                <Link to="/events/shoot-n-hoops">Shoot N HOOPS</Link>
                <Link to="/events/summer-sizzle">Summer Sizzle Circuit</Link>
                <Link to="/events/winter-wars">Winter Wars Circuit</Link>
                <Link to="/events/media-gallery">Media/Video Gallery</Link>
              </div>
            </div>
            <Link to="/facilities" className="navbar-link">Facilities</Link>
            {token ? (
              <Link to="/dashboard" className="navbar-btn btn-primary">Dashboard</Link>
            ) : (
              <Link to="/" className="navbar-btn btn-primary">Login</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', padding: '5rem 2rem', color: 'white' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <Snowflake size={64} style={{ margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '4rem', fontWeight: '700', marginBottom: '1rem', fontFamily: 'Space Grotesk, sans-serif' }}>
            Winter Wars Circuit
          </h1>
          <p style={{ fontSize: '1.5rem', opacity: 0.95, maxWidth: '800px', margin: '0 auto 2rem' }}>
            October - February | St. Paul Parks | 5 Grade Divisions
          </p>
          <Button style={{ background: 'white', color: '#3b82f6', padding: '1rem 2.5rem', fontSize: '1.2rem', fontWeight: '600' }}>
            Register Your Team
          </Button>
        </div>
      </section>

      {/* Overview */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <Card style={{ background: '#eff6ff', border: '2px solid #3b82f6' }}>
              <CardHeader>
                <Calendar size={40} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                <CardTitle style={{ color: '#1e40af' }}>Season</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ fontSize: '1.8rem', fontWeight: '700', color: '#3b82f6' }}>October - February</p>
                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Monthly tournaments all winter long</p>
              </CardContent>
            </Card>

            <Card style={{ background: '#eff6ff', border: '2px solid #3b82f6' }}>
              <CardHeader>
                <Trophy size={40} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                <CardTitle style={{ color: '#1e40af' }}>Entry Fee</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ fontSize: '1.8rem', fontWeight: '700', color: '#3b82f6' }}>$198.75</p>
                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Per team, per tournament</p>
              </CardContent>
            </Card>

            <Card style={{ background: '#eff6ff', border: '2px solid #3b82f6' }}>
              <CardHeader>
                <MapPin size={40} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                <CardTitle style={{ color: '#1e40af' }}>Format</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ fontSize: '1.4rem', fontWeight: '600', color: '#3b82f6' }}>Pool Play</p>
                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>4-team limit per tournament</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Divisions */}
      <section style={{ padding: '4rem 2rem', background: '#f8f9ff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem', color: '#1e293b' }}>
            Grade Divisions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
            {divisions.map((division, idx) => (
              <div key={idx} style={{ background: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center', border: '2px solid #3b82f6' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#3b82f6' }}>
                  {division}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Venues */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem', color: '#1e293b' }}>
            St. Paul Parks Venues
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {venues.map((venue, idx) => (
              <div key={idx} style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '12px', border: '2px solid #93c5fd' }}>
                <MapPin size={24} style={{ color: '#3b82f6', marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e40af' }}>
                  {venue}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Format */}
      <section style={{ padding: '4rem 2rem', background: '#f8f9ff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem', color: '#1e293b' }}>
            Tournament Format & Benefits
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#3b82f6' }}>Pool Play Structure</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>4-team maximum per tournament</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Guaranteed 3 games minimum</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Round-robin format</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Championship game finale</span>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#3b82f6' }}>Development Focus</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Skill-building emphasis</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Competitive game experience</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Winter conditioning</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Team bonding opportunities</span>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#3b82f6' }}>Affordable Excellence</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Lower entry fees</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Quality indoor facilities</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Professional officiating</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  <span>Awards & recognition</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default WinterWars;