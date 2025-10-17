import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, Users, DollarSign, Calendar, 
  FileText, Image, MessageSquare, Bell,
  MapPin, Award, BarChart3, PieChart
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [registrations, setRegistrations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      
      const [overviewRes, revenueRes, registrationsRes] = await Promise.all([
        axios.get(`${API}/api/admin/analytics/overview`, { headers }),
        axios.get(`${API}/api/admin/analytics/revenue`, { headers, params: { period } }),
        axios.get(`${API}/api/admin/analytics/registrations`, { headers, params: { period } })
      ]);
      
      setOverview(overviewRes.data);
      setRevenue(revenueRes.data);
      setRegistrations(registrationsRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, sublabel, color, trend }) => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: `${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}>
        <Icon size={24} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>
          {label}
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>
          {value}
        </div>
        {sublabel && (
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {sublabel}
          </div>
        )}
        {trend && (
          <div style={{ 
            fontSize: '0.85rem', 
            color: trend > 0 ? '#10b981' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginTop: '0.5rem'
          }}>
            <TrendingUp size={14} />
            {trend > 0 ? '+' : ''}{trend}% this period
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <div style={{
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        Loading analytics...
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  if (!overview) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        Failed to load analytics
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1e293b' }}>
            Analytics Dashboard
          </h2>
          <p style={{ color: '#64748b' }}>
            Monitor your platform performance and key metrics
          </p>
        </div>
        
        {/* Period Selector */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['7d', '30d', '90d', '365d'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '0.5rem 1rem',
                background: period === p ? '#3b82f6' : 'white',
                color: period === p ? 'white' : '#64748b',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          icon={Users}
          label="Total Users"
          value={overview.users.total}
          sublabel={`+${overview.users.new_30d} new in last 30 days`}
          color="#3b82f6"
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${overview.payments.total_revenue.toFixed(2)}`}
          sublabel={`${overview.payments.completed} completed transactions`}
          color="#10b981"
        />
        <StatCard
          icon={FileText}
          label="Total Registrations"
          value={overview.registrations.total_youth + overview.registrations.total_adult}
          sublabel={`${overview.registrations.pending} pending approval`}
          color="#f59e0b"
        />
        <StatCard
          icon={Calendar}
          label="Upcoming Events"
          value={overview.events.upcoming}
          sublabel={`${overview.events.total} total events`}
          color="#8b5cf6"
        />
      </div>

      {/* Secondary Metrics */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <MapPin size={20} style={{ color: '#06b6d4' }} />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Facilities</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
            {overview.facilities.total}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {overview.facilities.bookings} bookings
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Award size={20} style={{ color: '#ec4899' }} />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Teams</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
            {overview.teams.total}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <FileText size={20} style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>News Posts</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
            {overview.content.news_published}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            of {overview.content.news_total} total
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Image size={20} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Gallery</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
            {overview.content.gallery_images}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            photos
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <MessageSquare size={20} style={{ color: '#8b5cf6' }} />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Testimonials</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
            {overview.content.testimonials_approved}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            approved
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Bell size={20} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Notifications</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
            {overview.notifications.total}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {overview.notifications.unread} unread
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Revenue Chart */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <BarChart3 size={24} style={{ color: '#3b82f6' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', margin: 0 }}>Revenue Trend</h3>
          </div>
          {revenue && revenue.data.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {revenue.data.slice(-10).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', minWidth: '80px' }}>
                    {new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '4px', height: '24px', position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      background: '#3b82f6',
                      borderRadius: '4px',
                      width: `${(item.revenue / Math.max(...revenue.data.map(d => d.revenue))) * 100}%`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '0.5rem'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: '600' }}>
                        ${item.revenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              No revenue data for this period
            </div>
          )}
        </div>

        {/* Registration Stats */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <PieChart size={24} style={{ color: '#f59e0b' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', margin: 0 }}>Registration Status</h3>
          </div>
          {registrations && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
                  Youth Registrations
                </div>
                {registrations.youth_by_status.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'capitalize' }}>
                      {item._id || 'Unknown'}:
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>
                  Adult Registrations
                </div>
                {registrations.adult_by_status.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'capitalize' }}>
                      {item._id || 'Unknown'}:
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            View Pending Registrations ({overview.registrations.pending})
          </button>
          <button style={{
            padding: '0.75rem 1.5rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Export Revenue Report
          </button>
          <button style={{
            padding: '0.75rem 1.5rem',
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Manage Upcoming Events ({overview.events.upcoming})
          </button>
        </div>
      </div>
    </div>
  );
}
