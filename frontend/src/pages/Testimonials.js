import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Quote, Send, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    author_name: '',
    author_role: 'Parent',
    content: '',
    rating: 5,
    program: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const roles = ['Parent', 'Player', 'Coach', 'Alumni', 'Volunteer'];
  
  const programs = [
    'Shoot N HOOPS Tournament',
    'Summer Sizzle',
    'Winter Wars',
    'Basketball Camps',
    'Skills Clinics',
    'Training Programs',
    'Team Programs',
    'Other'
  ];

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/testimonials`, {
        params: { approved_only: true, limit: 50 }
      });
      setTestimonials(response.data);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.author_name || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API}/api/testimonials`, formData);
      
      toast.success('Thank you! Your testimonial will be reviewed shortly.');
      
      setFormData({
        author_name: '',
        author_role: 'Parent',
        content: '',
        rating: 5,
        program: ''
      });
      setShowForm(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit testimonial');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 28 : 20}
            fill={star <= rating ? '#f59e0b' : 'none'}
            stroke={star <= rating ? '#f59e0b' : '#d1d5db'}
            style={{ 
              cursor: interactive ? 'pointer' : 'default',
              transition: 'all 0.2s'
            }}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  const getRoleColor = (role) => {
    const colors = {
      'Parent': '#3b82f6',
      'Player': '#10b981',
      'Coach': '#8b5cf6',
      'Alumni': '#f59e0b',
      'Volunteer': '#ec4899'
    };
    return colors[role] || '#6b7280';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        padding: '4rem 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem' }}>
            What People Say About Us
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem' }}>
            Hear from our community of players, parents, and coaches
          </p>
          <Button
            onClick={() => setShowForm(true)}
            style={{
              background: 'white',
              color: '#1e293b',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Send size={20} />
            Share Your Experience
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        {/* Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '4rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: '700', color: '#3b82f6' }}>
              {testimonials.length}+
            </div>
            <div style={{ fontSize: '1.1rem', color: '#64748b' }}>
              Happy Families
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: '700', color: '#10b981' }}>
              4.9
            </div>
            <div style={{ fontSize: '1.1rem', color: '#64748b' }}>
              Average Rating
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: '700', color: '#f59e0b' }}>
              10+
            </div>
            <div style={{ fontSize: '1.1rem', color: '#64748b' }}>
              Years of Excellence
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading testimonials...
          </div>
        ) : testimonials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <Quote size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>No testimonials yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '2rem',
                  boxShadow: testimonial.featured 
                    ? '0 10px 40px rgba(59, 130, 246, 0.2)' 
                    : '0 1px 3px rgba(0,0,0,0.1)',
                  border: testimonial.featured ? '2px solid #3b82f6' : 'none',
                  position: 'relative',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = testimonial.featured
                    ? '0 15px 50px rgba(59, 130, 246, 0.25)'
                    : '0 10px 30px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = testimonial.featured
                    ? '0 10px 40px rgba(59, 130, 246, 0.2)'
                    : '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                {/* Featured Badge */}
                {testimonial.featured && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: '#3b82f6',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '15px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    Featured
                  </div>
                )}

                {/* Quote Icon */}
                <Quote size={32} style={{ color: '#e5e7eb', marginBottom: '1rem' }} />

                {/* Rating */}
                <div style={{ marginBottom: '1rem' }}>
                  {renderStars(testimonial.rating)}
                </div>

                {/* Content */}
                <p style={{
                  fontSize: '1rem',
                  lineHeight: '1.7',
                  color: '#334155',
                  marginBottom: '1.5rem',
                  fontStyle: 'italic'
                }}>
                  "{testimonial.content}"
                </p>

                {/* Author Info */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: getRoleColor(testimonial.author_role) + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: getRoleColor(testimonial.author_role)
                  }}>
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                      {testimonial.author_name}
                    </div>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span
                        style={{
                          padding: '0.15rem 0.5rem',
                          background: getRoleColor(testimonial.author_role) + '20',
                          color: getRoleColor(testimonial.author_role),
                          borderRadius: '10px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}
                      >
                        {testimonial.author_role}
                      </span>
                      {testimonial.program && (
                        <span style={{ fontSize: '0.85rem' }}>
                          • {testimonial.program}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submission Form Modal */}
      {showForm && (
        <div
          onClick={() => setShowForm(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem'
            }}
          >
            <h2 style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Share Your Experience
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Label htmlFor="author_name">Your Name *</Label>
                <Input
                  id="author_name"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <Label htmlFor="author_role">Your Role *</Label>
                <select
                  id="author_role"
                  value={formData.author_role}
                  onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                  required
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <Label htmlFor="program">Program/Service (Optional)</Label>
                <select
                  id="program"
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select a program</option>
                  {programs.map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <Label>Rating *</Label>
                <div style={{ marginTop: '0.5rem' }}>
                  {renderStars(formData.rating, true, (rating) => 
                    setFormData({ ...formData, rating })
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <Label htmlFor="content">Your Testimonial *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Share your experience with MNASE Basketball League..."
                  rows={6}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    background: '#3b82f6',
                    color: 'white',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Testimonial'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    color: '#64748b',
                    border: '1px solid #e5e7eb',
                    padding: '0.75rem',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
