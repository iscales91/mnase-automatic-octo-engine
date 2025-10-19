import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

function RestrictedAccess({ message, requiredRole }) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: 'white',
        borderRadius: '16px',
        padding: '3rem',
        textAlign: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '1.5rem' 
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={40} color="#dc2626" />
          </div>
        </div>

        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: '#1e293b',
          marginBottom: '1rem',
          fontFamily: 'Space Grotesk, sans-serif'
        }}>
          Access Restricted
        </h1>

        <p style={{ 
          fontSize: '1.1rem', 
          color: '#64748b', 
          marginBottom: '0.5rem',
          lineHeight: '1.6'
        }}>
          {message || 'You do not have permission to access this page.'}
        </p>

        {requiredRole && (
          <p style={{ 
            fontSize: '0.95rem', 
            color: '#94a3b8', 
            marginBottom: '2rem'
          }}>
            Required role: <strong>{requiredRole}</strong>
          </p>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s'
            }}>
              Go to Homepage
            </button>
          </Link>

          <Link to="/contact" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              borderRadius: '8px',
              border: '2px solid #3b82f6',
              fontWeight: '600',
              cursor: 'pointer',
              background: 'transparent',
              color: '#3b82f6',
              transition: 'all 0.2s'
            }}>
              Contact Support
            </button>
          </Link>
        </div>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#f8fafc', 
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#64748b'
        }}>
          <p style={{ margin: 0 }}>
            💡 If you believe you should have access, please contact your administrator or{' '}
            <Link to="/contact" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>
              reach out to support
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RestrictedAccess;
