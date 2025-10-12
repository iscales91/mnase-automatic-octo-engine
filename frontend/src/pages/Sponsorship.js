import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

function Sponsorship() {
  const [formData, setFormData] = useState({
    company: '',
    contact: '',
    email: '',
    phone: '',
    interest: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement sponsorship form submission to backend
    toast.success('Thank you for your interest! We\'ll contact you within 48 hours.');
    setFormData({ company: '', contact: '', email: '', phone: '', interest: '', message: '' });
  };

  const tiers = [
    {
      name: 'Bronze Partner',
      price: '$1,000 - $2,499',
      color: '#cd7f32',
      benefits: [
        'Logo on website sponsor page',
        'Social media recognition (2 posts)',
        'Recognition at one event',
        'Thank you certificate'
      ]
    },
    {
      name: 'Silver Partner',
      price: '$2,500 - $4,999',
      color: '#c0c0c0',
      benefits: [
        'All Bronze benefits',
        'Logo on team jerseys (one team)',
        'Social media recognition (4 posts)',
        'Recognition at all events',
        'Banner at one facility',
        '2 complimentary tournament passes'
      ]
    },
    {
      name: 'Gold Partner',
      price: '$5,000 - $9,999',
      color: '#ffd700',
      benefits: [
        'All Silver benefits',
        'Logo on multiple team jerseys',
        'Dedicated sponsor spotlight page',
        'Social media recognition (8 posts)',
        'Banners at multiple facilities',
        '4 complimentary tournament passes',
        'VIP seating at championship games'
      ]
    },
    {
      name: 'Platinum Partner',
      price: '$10,000+',
      color: '#e5e4e2',
      benefits: [
        'All Gold benefits',
        'Title sponsor of event/tournament',
        'Logo on all marketing materials',
        'Exclusive social media campaign',
        'Premium banners at all facilities',
        '10 complimentary tournament passes',
        'VIP experience at all major events',
        'Named scholarship opportunity',
        'Custom partnership activation'
      ]
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
            <Link to="/sponsorship" className="navbar-link">Sponsorship</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
        padding: '6rem 2rem 4rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '1.5rem',
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
            Partner With MNASE
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#94a3b8', maxWidth: '800px', margin: '0 auto' }}>
            Support youth basketball and grow your brand in the Minnesota community
          </p>
        </div>
      </section>

      {/* Impact Section */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem', color: '#1e293b' }}>
            Your Impact as a Sponsor
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏀</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>500+ Athletes</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>Reach hundreds of young athletes and their families throughout Minnesota</p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>50+ Events</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>Brand visibility at tournaments, camps, clinics, and community events</p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💼</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Community Impact</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>Support character development, leadership, and educational excellence</p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📱</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Digital Reach</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>Exposure through website, social media, and email communications</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem', color: '#1e293b' }}>
            Sponsorship Tiers
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {tiers.map((tier, index) => (
              <div 
                key={index}
                data-testid={`tier-${index}`}
                style={{ 
                  padding: '2.5rem 2rem',
                  background: 'white',
                  borderRadius: '16px',
                  border: '2px solid #e8eeff',
                  borderTop: `6px solid ${tier.color}`,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1e293b' }}>
                  {tier.name}
                </h3>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#dc2626', marginBottom: '2rem' }}>
                  {tier.price}
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} style={{ 
                      fontSize: '1rem', 
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem'
                    }}>
                      <span style={{ color: '#dc2626', fontWeight: '700' }}>✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Packages */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b' }}>
            Custom Partnership Opportunities
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '2rem', lineHeight: '1.8' }}>
            Looking for something specific? We offer customized sponsorship packages including title sponsorships, event naming rights, scholarship funds, and more. Let's create a partnership that aligns with your business goals and community values.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>Tournament Titles</h4>
              <p style={{ color: '#64748b' }}>Become the title sponsor of our major tournaments</p>
            </div>
            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>Scholarship Funds</h4>
              <p style={{ color: '#64748b' }}>Create a named scholarship for deserving athletes</p>
            </div>
            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>Facility Naming</h4>
              <p style={{ color: '#64748b' }}>Name a court or training facility</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsorship Form */}
      <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '700', textAlign: 'center', marginBottom: '1rem', color: '#1e293b' }}>
            Become a Sponsor
          </h2>
          <p style={{ fontSize: '1.2rem', textAlign: 'center', color: '#64748b', marginBottom: '3rem' }}>
            Fill out the form below and we'll send you our complete sponsorship deck
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'white', padding: '2rem', borderRadius: '16px' }}>
            <div>
              <Label htmlFor="company" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Company/Organization *</Label>
              <Input
                id="company"
                data-testid="sponsor-company"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                required
                style={{ padding: '0.75rem', fontSize: '1rem' }}
              />
            </div>
            <div>
              <Label htmlFor="contact" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Contact Name *</Label>
              <Input
                id="contact"
                data-testid="sponsor-contact"
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
                required
                style={{ padding: '0.75rem', fontSize: '1rem' }}
              />
            </div>
            <div>
              <Label htmlFor="email" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Email *</Label>
              <Input
                id="email"
                type="email"
                data-testid="sponsor-email"
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
                data-testid="sponsor-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                style={{ padding: '0.75rem', fontSize: '1rem' }}
              />
            </div>
            <div>
              <Label htmlFor="interest" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Sponsorship Interest *</Label>
              <Input
                id="interest"
                data-testid="sponsor-interest"
                placeholder="e.g., Gold Partner, Custom Package"
                value={formData.interest}
                onChange={(e) => setFormData({...formData, interest: e.target.value})}
                required
                style={{ padding: '0.75rem', fontSize: '1rem' }}
              />
            </div>
            <div>
              <Label htmlFor="message" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Additional Information</Label>
              <Textarea
                id="message"
                data-testid="sponsor-message"
                placeholder="Tell us about your sponsorship goals"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                style={{ padding: '0.75rem', fontSize: '1rem' }}
              />
            </div>
            <Button 
              type="submit" 
              data-testid="sponsor-submit"
              style={{ 
                padding: '1rem 2rem', 
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                border: 'none',
                width: '100%'
              }}
            >
              Request Sponsorship Deck
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Sponsorship;