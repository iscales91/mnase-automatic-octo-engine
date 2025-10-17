import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Image, Camera, Play } from 'lucide-react';

function MediaGallery() {
  const token = localStorage.getItem('token');

  return (
    <div>
      {/* Navbar */}
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
      <section style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', padding: '5rem 2rem', color: 'white' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <Camera size={64} style={{ margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '4rem', fontWeight: '700', marginBottom: '1rem', fontFamily: 'Space Grotesk, sans-serif' }}>
            Media & Video Gallery
          </h1>
          <p style={{ fontSize: '1.5rem', opacity: 0.95, maxWidth: '800px', margin: '0 auto' }}>
            Relive the best moments from MNASE tournaments, games, and events
          </p>
        </div>
      </section>

      {/* Livestream Info */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Card style={{ background: '#f5f3ff', border: '3px solid #7c3aed' }}>
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Video size={40} style={{ color: '#7c3aed' }} />
                <CardTitle style={{ fontSize: '2rem', color: '#5b21b6' }}>Live Streaming with Veo</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: '1.6', marginBottom: '1rem' }}>
                All MNASE tournaments and select events are live-streamed using Veo camera technology. Watch games in real-time or access archived footage after the event.
              </p>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '2px solid #c4b5fd' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '1rem', color: '#5b21b6' }}>Livestream Features:</h4>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#64748b' }}>
                  <li>HD quality streaming</li>
                  <li>Multiple camera angles</li>
                  <li>Automatic game recording</li>
                  <li>Instant replay capabilities</li>
                  <li>Shareable game links</li>
                  <li>Download highlights</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button style={{ background: '#7c3aed', width: '100%', fontSize: '1.1rem', padding: '1.25rem' }}>
                <Play size={20} style={{ marginRight: '0.5rem' }} />
                Watch Live Games
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Gallery Categories */}
      <section style={{ padding: '4rem 2rem', background: '#f8f9ff' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem', color: '#1e293b' }}>
            Browse by Category
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <Card style={{ cursor: 'pointer', transition: 'all 0.3s' }}>
              <CardHeader>
                <Video size={40} style={{ color: '#dc2626', marginBottom: '1rem' }} />
                <CardTitle style={{ color: '#991b1b' }}>Tournament Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: '#64748b' }}>Watch the best plays and moments from Shoot N HOOPS tournaments</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Highlights</Button>
              </CardFooter>
            </Card>

            <Link to="/gallery" style={{ textDecoration: 'none' }}>
              <Card style={{ cursor: 'pointer', transition: 'all 0.3s', height: '100%' }}>
                <CardHeader>
                  <Image size={40} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
                  <CardTitle style={{ color: '#92400e' }}>Photo Galleries</CardTitle>
                </CardHeader>
                <CardContent>
                  <p style={{ color: '#64748b' }}>Browse action shots and team photos from events and games</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View Photos</Button>
                </CardFooter>
              </Card>
            </Link>

            <Card style={{ cursor: 'pointer', transition: 'all 0.3s' }}>
              <CardHeader>
                <Camera size={40} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                <CardTitle style={{ color: '#1e40af' }}>Full Game Archives</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: '#64748b' }}>Access complete game recordings from past tournaments</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Browse Archives</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Media Policy */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', textAlign: 'center', marginBottom: '2rem', color: '#1e293b' }}>
            Media & Filming Policy
          </h2>
          <div style={{ background: '#f8f9ff', padding: '2rem', borderRadius: '12px', border: '2px solid #e2e8f0' }}>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '1rem' }}>
              All participants and spectators consent to being filmed during MNASE events via registration. Videos and photos may be used for promotional purposes, highlight reels, and archival footage.
            </p>
            <p style={{ color: '#475569', lineHeight: '1.8' }}>
              Sideline filming by parents and spectators is permitted but must not interfere with game play or official videography. Commercial filming requires prior approval from tournament directors.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MediaGallery;