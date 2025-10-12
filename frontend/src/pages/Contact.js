import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/contact`, formData);
      toast.success('Message sent! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send message. Please try again.');
    }
  };

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
            <Link to="/contact" className="navbar-link">Contact</Link>
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
            Get In Touch
          </h1>
          <p style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.9)' }}>
            Have questions? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem' }}>
          {/* Contact Form */}
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b' }}>
              Send Us a Message
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <Label htmlFor="name" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Name *</Label>
                <Input
                  id="name"
                  data-testid="contact-name"
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
                  data-testid="contact-email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  style={{ padding: '0.75rem', fontSize: '1rem' }}
                />
              </div>
              <div>
                <Label htmlFor="phone" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  data-testid="contact-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{ padding: '0.75rem', fontSize: '1rem' }}
                />
              </div>
              <div>
                <Label htmlFor="subject" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Subject *</Label>
                <Input
                  id="subject"
                  data-testid="contact-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                  style={{ padding: '0.75rem', fontSize: '1rem' }}
                />
              </div>
              <div>
                <Label htmlFor="message" style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Message *</Label>
                <Textarea
                  id="message"
                  data-testid="contact-message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                  rows={6}
                  style={{ padding: '0.75rem', fontSize: '1rem' }}
                />
              </div>
              <Button 
                type="submit" 
                data-testid="contact-submit"
                style={{ 
                  padding: '1rem 2rem', 
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  border: 'none',
                  width: 'fit-content'
                }}
              >
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', color: '#1e293b' }}>
              Contact Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ 
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)',
                borderRadius: '12px',
                border: '2px solid #e8eeff'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📧</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Email</h3>
                <a href="mailto:info@mnasebasketball.com" style={{ color: '#dc2626', fontSize: '1.1rem' }}>info@mnasebasketball.com</a>
              </div>
              <div style={{ 
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)',
                borderRadius: '12px',
                border: '2px solid #e8eeff'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📱</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Phone</h3>
                <a href="tel:+16125551234" style={{ color: '#dc2626', fontSize: '1.1rem' }}>(612) 555-1234</a>
              </div>
              <div style={{ 
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)',
                borderRadius: '12px',
                border: '2px solid #e8eeff'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📍</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Location</h3>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Minneapolis, Minnesota</p>
              </div>
              <div style={{ 
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)',
                borderRadius: '12px',
                border: '2px solid #e8eeff'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🕐</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Office Hours</h3>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '0.3rem' }}>Monday - Friday: 9am - 6pm</p>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Saturday: 10am - 4pm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>
            Looking for Quick Answers?
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '2rem' }}>
            Check out our FAQ page for common questions about programs, registration, and more.
          </p>
          <Link to="/faq">
            <Button style={{ 
              padding: '1rem 2rem', 
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              border: 'none'
            }}>
              View FAQs
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Contact;