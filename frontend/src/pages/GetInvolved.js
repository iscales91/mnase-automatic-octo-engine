import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function GetInvolved() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    availability: '',
    experience: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement volunteer form submission to backend
    toast.success('Thank you for your interest! We\'ll contact you soon.');
    setFormData({ name: '', email: '', phone: '', interest: '', availability: '', experience: '', message: '' });
  };

  const opportunities = [
    {
      title: 'Assistant Coach',
      icon: '🏀',
      description: 'Help lead practices and games. Basketball knowledge and passion for teaching required.',
      commitment: '6-10 hours/week during season'
    },
    {
      title: 'Team Manager',
      icon: '📅',
      description: 'Coordinate schedules, communicate with families, manage team logistics.',
      commitment: '3-5 hours/week'
    },
    {
      title: 'Event Volunteer',
      icon: '🎯',
      description: 'Assist with tournaments, camps, and special events. Setup, registration, and coordination.',
      commitment: 'Flexible, event-based'
    },
    {
      title: 'Referee',
      icon: '🐔',
      description: 'Officiate games for youth leagues. Training provided for new referees.',
      commitment: 'Varies by availability'
    },
    {
      title: 'Photographer/Videographer',
      icon: '📸',
      description: 'Capture game highlights, event coverage, and promotional content.',
      commitment: 'Flexible, event-based'
    },
    {
      title: 'Social Media Coordinator',
      icon: '📱',
      description: 'Create content, manage posts, engage with our online community.',
      commitment: '2-4 hours/week, remote'
    },
    {
      title: 'Fundraising Support',
      icon: '💰',
      description: 'Help with fundraising events, sponsor outreach, and donation campaigns.',
      commitment: 'Flexible, project-based'
    },
    {
      title: 'Facilities Setup',
      icon: '🛠️',
      description: 'Set up courts, equipment, and spaces for practices, games, and events.',
      commitment: '2-3 hours/event'
    }
  ];

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
                <Link to="/shoot-n-hoops">Shoot N HOOPS</Link>
                <Link to="/summer-sizzle">Summer Sizzle Circuit</Link>
                <Link to="/winter-wars">Winter Wars Circuit</Link>
                <Link to="/media-gallery">Media/Video Gallery</Link>
              </div>
            </div>
            <Link to="/facilities" className="navbar-link">Facilities</Link>
            <Link to="/about" className="navbar-link">About</Link>
            <Link to="/get-involved" className="navbar-link">Get Involved</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', 
        padding: '5rem 2rem 3rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '1rem',
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
            Get Involved
          </h1>
          <p style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.9)' }}>
            Join our team and make a difference in the lives of young athletes
          </p>
        </div>
      </section>

      {/* Opportunities Section */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>
              Volunteer Opportunities
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#64748b' }}>
              Whether you have 2 hours a month or 10 hours a week, we have opportunities that fit your schedule
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {opportunities.map((opp, index) => (
              <div 
                key={index}
                data-testid={`opportunity-${index}`}
                style={{ 
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)',
                  borderRadius: '16px',
                  border: '2px solid #e8eeff',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{opp.icon}</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
                  {opp.title}
                </h3>
                <p style={{ color: '#64748b', marginBottom: '1rem', lineHeight: '1.6' }}>
                  {opp.description}
                </p>
                <p style={{ color: '#dc2626', fontWeight: '600', fontSize: '0.9rem' }}>
                  ⏱️ {opp.commitment}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Volunteer Section */}
      <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem', color: '#1e293b' }}>
            Why Volunteer with MNASE?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❤️</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Make an Impact</h3>
              <p style={{ color: '#64748b' }}>Positively influence young athletes' lives and help them reach their potential</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Build Community</h3>
              <p style={{ color: '#64748b' }}>Connect with fellow basketball enthusiasts and become part of our family</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Gain Experience</h3>
              <p style={{ color: '#64748b' }}>Develop leadership, coaching, and organizational skills</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Have Fun</h3>
              <p style={{ color: '#64748b' }}>Enjoy the excitement of games, tournaments, and events</p>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer Application Form */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', textAlign: 'center', marginBottom: '1rem', color: '#1e293b' }}>
            Volunteer Application
          </h2>
          <p style={{ fontSize: '1.2rem', textAlign: 'center', color: '#64748b', marginBottom: '3rem' }}>
            Fill out the form below and we'll get in touch with you about opportunities
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <Label htmlFor="name" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Full Name *</Label>
              <Input
                id="name"
                data-testid="volunteer-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                style={{ padding: '0.75rem', fontSize: '1rem' }}
              />
            </div>
            <div>
              <Label htmlFor="email" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Email *</Label>
              <Input
                id="email"
                type="email"
                data-testid="volunteer-email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={{ padding: '0.75rem', fontSize: '1rem' }}
              />
            </div>
            <div>
              <Label htmlFor="phone" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Phone *</Label>
              <Input
                id="phone"
                type="tel"
                data-testid="volunteer-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                style={{ padding: '0.75rem', fontSize: '1rem' }}
              />
            </div>
            <div>
              <Label htmlFor="interest" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Area of Interest *</Label>
              <Input
                id="interest"
                data-testid="volunteer-interest"
                placeholder="e.g., Assistant Coach, Event Volunteer"
                value={formData.interest}
                onChange={(e) => setFormData({...formData, interest: e.target.value})}
                required
                style={{ padding: '0.75rem', fontSize: '1rem' }}
              />
            </div>
            <div>
              <Label htmlFor="availability" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Availability *</Label>
              <Input
                id="availability"
                data-testid="volunteer-availability"
                placeholder="e.g., Weekends, Evenings, 5-10 hours/week"
                value={formData.availability}
                onChange={(e) => setFormData({...formData, availability: e.target.value})}
                required
                style={{ padding: '0.75rem', fontSize: '1rem' }}
              />
            </div>
            <div>
              <Label htmlFor="experience" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Relevant Experience</Label>
              <Textarea
                id="experience"
                data-testid="volunteer-experience"
                placeholder="Tell us about your basketball experience, coaching background, or relevant skills"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                rows={4}
                style={{ padding: '0.75rem', fontSize: '1rem' }}
              />
            </div>
            <div>
              <Label htmlFor="message" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Additional Information</Label>
              <Textarea
                id="message"
                data-testid="volunteer-message"
                placeholder="Any additional information you'd like to share"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                style={{ padding: '0.75rem', fontSize: '1rem' }}
              />
            </div>
            <Button 
              type="submit" 
              data-testid="volunteer-submit"
              style={{ 
                padding: '1rem 2rem', 
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                border: 'none',
                width: '100%'
              }}
            >
              Submit Application
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default GetInvolved;