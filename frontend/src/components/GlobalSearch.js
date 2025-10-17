import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, X, Calendar, MapPin, Users, Home, Award } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function GlobalSearch({ onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch();
      } else {
        setResults(null);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const performSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API}/api/search/global`, {
        params: { search: searchTerm, limit: 20 }
      });
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'event':
        return <Calendar size={20} style={{ color: '#3b82f6' }} />;
      case 'program':
        return <Award size={20} style={{ color: '#10b981' }} />;
      case 'facility':
        return <Home size={20} style={{ color: '#f59e0b' }} />;
      case 'team':
        return <Users size={20} style={{ color: '#8b5cf6' }} />;
      case 'calendar_event':
        return <MapPin size={20} style={{ color: '#ec4899' }} />;
      default:
        return <Search size={20} />;
    }
  };

  const getResultTypeLabel = (type) => {
    const labels = {
      event: 'Event',
      program: 'Program',
      facility: 'Facility',
      team: 'Team',
      calendar_event: 'Calendar'
    };
    return labels[type] || type;
  };

  const handleResultClick = (result) => {
    // Navigate to appropriate page based on result type
    switch (result.result_type) {
      case 'event':
        window.location.href = `/events`;
        break;
      case 'program':
        window.location.href = `/programs`;
        break;
      case 'facility':
        window.location.href = `/facilities`;
        break;
      case 'team':
        window.location.href = `/scores`;
        break;
      case 'calendar_event':
        window.location.href = `/events`;
        break;
      default:
        break;
    }
    if (onClose) onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '2rem',
        zIndex: 9999,
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          maxWidth: '700px',
          width: '100%',
          marginTop: '5rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div style={{ 
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Search size={24} style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search events, programs, facilities, teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1.1rem',
              padding: '0.5rem'
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              color: '#64748b'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Results */}
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {loading && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
              Searching...
            </div>
          )}

          {error && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
              {error}
            </div>
          )}

          {searchTerm.length > 0 && searchTerm.length < 2 && !results && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              Type at least 2 characters to search
            </div>
          )}

          {results && results.total_count === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No results found</p>
              <p style={{ fontSize: '0.9rem' }}>Try different keywords</p>
            </div>
          )}

          {results && results.total_count > 0 && (
            <>
              {/* Results Summary */}
              <div style={{ 
                padding: '1rem 1.5rem',
                background: '#f8fafc',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '0.9rem',
                color: '#64748b'
              }}>
                Found {results.total_count} results
                {results.results_by_type.events > 0 && ` • ${results.results_by_type.events} events`}
                {results.results_by_type.programs > 0 && ` • ${results.results_by_type.programs} programs`}
                {results.results_by_type.facilities > 0 && ` • ${results.results_by_type.facilities} facilities`}
                {results.results_by_type.teams > 0 && ` • ${results.results_by_type.teams} teams`}
              </div>

              {/* Results List */}
              {results.results.map((result, index) => (
                <div
                  key={`${result.result_type}-${result.id || index}`}
                  onClick={() => handleResultClick(result)}
                  style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ paddingTop: '0.2rem' }}>
                    {getResultIcon(result.result_type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      marginBottom: '0.25rem'
                    }}>
                      <span style={{ 
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        {result.title || result.name}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.15rem 0.5rem',
                        background: '#e0e7ff',
                        color: '#3730a3',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        {getResultTypeLabel(result.result_type)}
                      </span>
                    </div>
                    {result.description && (
                      <p style={{ 
                        fontSize: '0.85rem',
                        color: '#64748b',
                        margin: 0,
                        lineHeight: '1.4'
                      }}>
                        {result.description.substring(0, 120)}
                        {result.description.length > 120 && '...'}
                      </p>
                    )}
                    {(result.location || result.date) && (
                      <div style={{ 
                        fontSize: '0.8rem',
                        color: '#94a3b8',
                        marginTop: '0.5rem',
                        display: 'flex',
                        gap: '1rem'
                      }}>
                        {result.location && (
                          <span>📍 {result.location}</span>
                        )}
                        {result.date && (
                          <span>📅 {result.date}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Search Tips */}
        {!searchTerm && (
          <div style={{ 
            padding: '2rem',
            background: '#f8fafc',
            borderTop: '1px solid #e5e7eb'
          }}>
            <p style={{ 
              fontSize: '0.9rem',
              color: '#64748b',
              margin: 0,
              textAlign: 'center'
            }}>
              💡 Search for events, programs, facilities, teams, and more
            </p>
          </div>
        )}
      </div>

      <style>
        {`
          .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
