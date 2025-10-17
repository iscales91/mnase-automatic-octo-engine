import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageCarousel from '@/components/ImageCarousel';
import GlobalSearch from '@/components/GlobalSearch';
import NotificationBell from '@/components/NotificationBell';
import axios from 'axios';
import { toast } from 'sonner';
import { Search as SearchIcon } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    date_of_birth: '',
    phone: ''
  });
  const token = localStorage.getItem('token');

  // Carousel images for MNASE Basketball League
  const carouselImages = [
    {
      url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1600&h=900&fit=crop',
      title: 'Elite Mammoths Program',
      description: 'March–June Travel Program - Competitive play and tournament preparation'
    },
    {
      url: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=1600&h=900&fit=crop',
      title: 'State-of-the-Art Facilities',
      description: 'Book our premium basketball courts and training facilities'
    },
    {
      url: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=1600&h=900&fit=crop',
      title: 'Weekend Draft League',
      description: 'Weekly competitive games - Get drafted Friday, play Saturday'
    },
    {
      url: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1600&h=900&fit=crop',
      title: 'Year-Round Development',
      description: 'Programs designed to build skills, character, and community'
    }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Welcome back!');
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/auth/register`, registerData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Account created successfully!');
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    window.location.href = '/';
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
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Events ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/shoot-n-hoops" data-testid="nav-shoot-n-hoops-link">Shoot N HOOPS</Link>
                <Link to="/summer-sizzle" data-testid="nav-summer-sizzle-link">Summer Sizzle Circuit</Link>
                <Link to="/winter-wars" data-testid="nav-winter-wars-link">Winter Wars Circuit</Link>
                <Link to="/media-gallery" data-testid="nav-media-gallery-link">Media/Video Gallery</Link>
              </div>
            </div>
            <Link to="/facilities" className="navbar-link" data-testid="nav-facilities-link">Facilities</Link>
            <Link to="/about" className="navbar-link" data-testid="nav-about-link">About</Link>
            <Link to="/faq" className="navbar-link" data-testid="nav-faq-link">FAQ</Link>
            <Link to="/shop" className="navbar-link" data-testid="nav-shop-link">Shop</Link>
            <button 
              onClick={() => setShowSearch(true)} 
              className="navbar-btn" 
              style={{ 
                background: 'transparent', 
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              data-testid="search-btn"
            >
              <SearchIcon size={18} />
              Search
            </button>
            {token && <NotificationBell />}
            {token ? (
              <>
                <Link to="/dashboard" className="navbar-link" data-testid="nav-dashboard-link">Dashboard</Link>
                <button onClick={handleLogout} className="navbar-btn btn-secondary" data-testid="logout-btn">Logout</button>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)} className="navbar-btn btn-primary" data-testid="login-btn">Login</button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section with Carousel */}
      <section style={{ padding: '2rem', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Image Carousel */}
          <ImageCarousel images={carouselImages} autoPlay={true} interval={5000} />
          
          {/* Hero Content */}
          <div style={{ textAlign: 'center', padding: '3rem 2rem', marginTop: '2rem' }}>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: '700', 
              marginBottom: '1rem', 
              color: '#1e293b',
              fontFamily: 'Space Grotesk, sans-serif'
            }} data-testid="hero-title">
              Unleash The MENACE
            </h1>
            <p style={{ 
              fontSize: '1.5rem', 
              marginBottom: '2rem', 
              color: '#64748b',
              maxWidth: '800px',
              margin: '0 auto 2rem'
            }} data-testid="hero-subtitle">
              Mentorship. Networking. Athletics. Support. Experience.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/programs" style={{ textDecoration: 'none' }}>
                <button className="hero-btn" style={{
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  color: 'white',
                  boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)',
                  transition: 'all 0.3s'
                }} data-testid="hero-programs-btn">
                  Explore Programs
                </button>
              </Link>
              <Link to="/memberships" style={{ textDecoration: 'none' }}>
                <button className="hero-btn" style={{
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  borderRadius: '12px',
                  border: '2px solid #dc2626',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: 'transparent',
                  color: '#dc2626',
                  transition: 'all 0.3s'
                }} data-testid="hero-memberships-btn">
                  View Memberships
                </button>
              </Link>
              <Link to="/events" style={{ textDecoration: 'none' }}>
                <button className="hero-btn" style={{
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  borderRadius: '12px',
                  border: '2px solid #dc2626',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: 'transparent',
                  color: '#dc2626',
                  transition: 'all 0.3s'
                }} data-testid="hero-events-btn">
                  Upcoming Events
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mentality Academy Section */}
      <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ 
              fontSize: '3rem', 
              fontWeight: '700', 
              color: 'white',
              marginBottom: '1rem',
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
              Mentality Academy
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto' }}>
              Elevate your game with specialized training through our camps, clinics, and workshops
            </p>
          </div>

          <Tabs defaultValue="camps" className="w-full">
            <TabsList style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '0.5rem',
              borderRadius: '12px',
              marginBottom: '3rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <TabsTrigger 
                value="camps" 
                data-testid="camps-tab"
                style={{ 
                  padding: '0.75rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Camps
              </TabsTrigger>
              <TabsTrigger 
                value="clinics" 
                data-testid="clinics-tab"
                style={{ 
                  padding: '0.75rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Clinics
              </TabsTrigger>
              <TabsTrigger 
                value="workshops" 
                data-testid="workshops-tab"
                style={{ 
                  padding: '0.75rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Workshops
              </TabsTrigger>
            </TabsList>

            {/* Camps Tab */}
            <TabsContent value="camps" data-testid="camps-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '2rem',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    fontSize: '2rem'
                  }}>
                    🏀
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
                    Youth Basketball Camp
                  </h3>
                  <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    Summer basketball camp for ages 10-16. Professional coaching, skill development, and competitive games in a fun environment.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Duration:</strong> 5-day intensive
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Ages:</strong> 10-16
                    </div>
                    <div style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>
                      $200
                    </div>
                  </div>
                  <Button style={{ width: '100%', background: '#dc2626', border: 'none' }} data-testid="camp-register-1">
                    Register Now
                  </Button>
                </div>

                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '2rem',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    fontSize: '2rem'
                  }}>
                    🎯
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
                    Elite Skills Camp
                  </h3>
                  <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    Advanced camp for competitive players focusing on advanced techniques, game strategy, and mental toughness.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Duration:</strong> 3-day intensive
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Ages:</strong> 13-18
                    </div>
                    <div style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>
                      $350
                    </div>
                  </div>
                  <Button style={{ width: '100%', background: '#dc2626', border: 'none' }} data-testid="camp-register-2">
                    Register Now
                  </Button>
                </div>

                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '2rem',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    fontSize: '2rem'
                  }}>
                    ⭐
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
                    Holiday Break Camp
                  </h3>
                  <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    Stay active during school breaks with our holiday camps. Fun drills, games, and skill development in a festive atmosphere.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Duration:</strong> 3-day sessions
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Ages:</strong> 8-14
                    </div>
                    <div style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>
                      $175
                    </div>
                  </div>
                  <Button style={{ width: '100%', background: '#dc2626', border: 'none' }} data-testid="camp-register-3">
                    Register Now
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Clinics Tab */}
            <TabsContent value="clinics" data-testid="clinics-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '2rem'
                }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    fontSize: '2rem'
                  }}>
                    🎓
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
                    Shooting Clinic
                  </h3>
                  <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    Master your shooting form with our specialized clinic. Focus on mechanics, consistency, and shot selection.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Duration:</strong> 2 hours
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Schedule:</strong> Weekly sessions
                    </div>
                    <div style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>
                      $50
                    </div>
                  </div>
                  <Button style={{ width: '100%', background: '#dc2626', border: 'none' }} data-testid="clinic-register-1">
                    Book Clinic
                  </Button>
                </div>

                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '2rem'
                }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    fontSize: '2rem'
                  }}>
                    🛡️
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
                    Defense & Footwork Clinic
                  </h3>
                  <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    Lock down opponents with proper defensive stance, lateral movement, and positioning techniques.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Duration:</strong> 2 hours
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Schedule:</strong> Bi-weekly sessions
                    </div>
                    <div style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>
                      $50
                    </div>
                  </div>
                  <Button style={{ width: '100%', background: '#dc2626', border: 'none' }} data-testid="clinic-register-2">
                    Book Clinic
                  </Button>
                </div>

                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '2rem'
                }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    fontSize: '2rem'
                  }}>
                    ⚡
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
                    Ball Handling Clinic
                  </h3>
                  <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    Improve your handles with advanced dribbling drills, crossovers, and ball control exercises.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Duration:</strong> 2 hours
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Schedule:</strong> Weekly sessions
                    </div>
                    <div style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>
                      $50
                    </div>
                  </div>
                  <Button style={{ width: '100%', background: '#dc2626', border: 'none' }} data-testid="clinic-register-3">
                    Book Clinic
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Workshops Tab */}
            <TabsContent value="workshops" data-testid="workshops-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '2rem'
                }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    fontSize: '2rem'
                  }}>
                    🧠
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
                    Mental Toughness Workshop
                  </h3>
                  <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    Develop the mental game. Learn visualization, focus techniques, and pressure management strategies.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Duration:</strong> Half-day workshop
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Schedule:</strong> Monthly
                    </div>
                    <div style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>
                      $75
                    </div>
                  </div>
                  <Button style={{ width: '100%', background: '#dc2626', border: 'none' }} data-testid="workshop-register-1">
                    Reserve Spot
                  </Button>
                </div>

                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '2rem'
                }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    fontSize: '2rem'
                  }}>
                    🎬
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
                    Film Study Workshop
                  </h3>
                  <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    Learn to analyze game film like the pros. Understand offensive/defensive schemes and improve IQ.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Duration:</strong> 3-hour session
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Schedule:</strong> Bi-monthly
                    </div>
                    <div style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>
                      $60
                    </div>
                  </div>
                  <Button style={{ width: '100%', background: '#dc2626', border: 'none' }} data-testid="workshop-register-2">
                    Reserve Spot
                  </Button>
                </div>

                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '2rem'
                }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    fontSize: '2rem'
                  }}>
                    🏆
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
                    College Recruitment Workshop
                  </h3>
                  <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    Navigate the college recruitment process. Create highlight reels, contact coaches, and prepare for showcases.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Duration:</strong> Full-day workshop
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'white' }}>Schedule:</strong> Quarterly
                    </div>
                    <div style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>
                      $100
                    </div>
                  </div>
                  <Button style={{ width: '100%', background: '#dc2626', border: 'none' }} data-testid="workshop-register-3">
                    Reserve Spot
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            textAlign: 'center', 
            marginBottom: '3rem',
            color: '#1e293b'
          }}>
            Our Programs
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem' 
          }}>
            <div style={{ 
              padding: '2rem', 
              background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
              borderRadius: '16px',
              border: '2px solid #fee2e2',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#991b1b' }}>
                Elite Mammoths
              </h3>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                March–June travel program with competitive play and tournament preparation
              </p>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#dc2626', marginBottom: '1rem' }}>
                $608.59
              </div>
              <Link to="/programs">
                <Button style={{ background: '#dc2626' }}>Learn More</Button>
              </Link>
            </div>

            <div style={{ 
              padding: '2rem', 
              background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
              borderRadius: '16px',
              border: '2px solid #fee2e2',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#991b1b' }}>
                Second Chance Shots
              </h3>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                November–March program for athletes seeking development opportunities
              </p>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#dc2626', marginBottom: '1rem' }}>
                $250.00
              </div>
              <Link to="/programs">
                <Button style={{ background: '#dc2626' }}>Learn More</Button>
              </Link>
            </div>

            <div style={{ 
              padding: '2rem', 
              background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
              borderRadius: '16px',
              border: '2px solid #fee2e2',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#991b1b' }}>
                Lockdown 3on3
              </h3>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                July–September fast-paced 3-on-3 basketball league for ages 9-17
              </p>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#dc2626', marginBottom: '1rem' }}>
                $125.00
              </div>
              <Link to="/programs">
                <Button style={{ background: '#dc2626' }}>Learn More</Button>
              </Link>
            </div>

            <div style={{ 
              padding: '2rem', 
              background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
              borderRadius: '16px',
              border: '2px solid #fee2e2',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#991b1b' }}>
                Weekend Draft
              </h3>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                Year-round weekly draft-style games every Saturday
              </p>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#dc2626', marginBottom: '1rem' }}>
                $25.00
              </div>
              <Link to="/programs">
                <Button style={{ background: '#dc2626' }}>Learn More</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent data-testid="auth-dialog">
          <DialogHeader>
            <DialogTitle>Account</DialogTitle>
            <DialogDescription>Login or create a new account</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    data-testid="login-email-input"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    data-testid="login-password-input"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="login-submit-btn">Login</Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
                <div>
                  <Label htmlFor="register-name">Name</Label>
                  <Input
                    id="register-name"
                    data-testid="register-name-input"
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    data-testid="register-email-input"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-dob">Date of Birth (Must be 18+)</Label>
                  <Input
                    id="register-dob"
                    data-testid="register-dob-input"
                    type="date"
                    value={registerData.date_of_birth}
                    onChange={(e) => setRegisterData({...registerData, date_of_birth: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-phone">Phone (Optional)</Label>
                  <Input
                    id="register-phone"
                    data-testid="register-phone-input"
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                    placeholder="(123) 456-7890"
                  />
                </div>
                <div>
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    data-testid="register-password-input"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    required
                  />
                </div>
                <div style={{ 
                  padding: '0.75rem', 
                  background: '#fef2f2', 
                  borderRadius: '6px', 
                  border: '1px solid #fee2e2',
                  fontSize: '0.875rem',
                  color: '#991b1b'
                }}>
                  <strong>Note:</strong> You must be 18+ to create an account. Youth athletes (17 and under) must be registered by a parent or guardian.
                </div>
                <Button type="submit" className="w-full" data-testid="register-submit-btn">Create Account</Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Global Search Modal */}
      {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}
    </div>
  );
}

export default Home;