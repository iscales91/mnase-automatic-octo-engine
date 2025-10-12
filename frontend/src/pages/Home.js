import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageCarousel from '@/components/ImageCarousel';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ email: '', password: '', name: '' });
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
            <Link to="/memberships" className="navbar-link" data-testid="nav-memberships-link">Memberships</Link>
            <Link to="/events" className="navbar-link" data-testid="nav-events-link">Events</Link>
            <Link to="/facilities" className="navbar-link" data-testid="nav-facilities-link">Facilities</Link>
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

      {/* Hero Section */}
      <section className="hero-section" data-testid="hero-section">
        <div className="hero-content">
          <h1 className="hero-title" data-testid="hero-title">Welcome to MNASE Basketball League</h1>
          <p className="hero-subtitle" data-testid="hero-subtitle">
            Join Minnesota's premier basketball community. Register for events, book facilities, and connect with fellow players.
          </p>
          <div className="hero-buttons">
            <Link to="/programs" className="hero-btn hero-btn-primary" data-testid="hero-programs-btn">Explore Programs</Link>
            <Link to="/memberships" className="hero-btn hero-btn-secondary" data-testid="hero-memberships-btn">View Memberships</Link>
            <Link to="/events" className="hero-btn hero-btn-secondary" data-testid="hero-events-btn">Upcoming Events</Link>
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
                <Button type="submit" className="w-full" data-testid="register-submit-btn">Create Account</Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Home;