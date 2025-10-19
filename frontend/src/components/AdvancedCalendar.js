import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Download, X, Search } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdvancedCalendar() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState('month'); // month, list
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    search: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/calendar-events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(e => e.type === filters.type);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(e => 
        e.title?.toLowerCase().includes(searchLower) ||
        e.description?.toLowerCase().includes(searchLower) ||
        e.location?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredEvents(filtered);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const eventTypes = [
    { value: 'all', label: 'All Events', color: '#6b7280' },
    { value: 'program', label: 'Program', color: '#3b82f6' },
    { value: 'tournament', label: 'Tournament', color: '#f59e0b' },
    { value: 'camp', label: 'Camp', color: '#10b981' },
    { value: 'clinic', label: 'Clinic', color: '#8b5cf6' },
    { value: 'workshop', label: 'Workshop', color: '#ec4899' },
    { value: 'event', label: 'Event', color: '#06b6d4' },
    { value: 'other', label: 'Other', color: '#64748b' }
  ];

  const getTypeColor = (type) => {
    const eventType = eventTypes.find(t => t.value === type);
    return eventType ? eventType.color : '#6b7280';
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDate = (day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter(event => event.date === dateStr);
  };

  const changeMonth = (direction) => {
    let newMonth = selectedMonth + direction;
    let newYear = selectedYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
  };

  const exportToGoogleCalendar = (event) => {
    const startDate = new Date(`${event.date}T${event.time || '09:00'}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      details: event.description || '',
      location: event.location || '',
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  };

  const exportToICS = (event) => {
    const startDate = new Date(`${event.date}T${event.time || '09:00'}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MNASE Basketball League//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@mnasebasketball.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location || ''}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ padding: '0.5rem' }} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const isToday = 
        day === new Date().getDate() &&
        selectedMonth === new Date().getMonth() &&
        selectedYear === new Date().getFullYear();

      days.push(
        <div
          key={day}
          style={{
            border: '1px solid #e5e7eb',
            padding: '0.5rem',
            minHeight: '75px',
            maxHeight: '90px',
            background: isToday ? '#eff6ff' : 'white',
            cursor: dayEvents.length > 0 ? 'pointer' : 'default',
            position: 'relative',
            overflow: 'hidden'
          }}
          onClick={() => {
            if (dayEvents.length > 0) {
              setSelectedEvent(dayEvents[0]);
            }
          }}
        >
          <div
            style={{
              fontWeight: isToday ? '700' : '600',
              marginBottom: '0.4rem',
              color: isToday ? '#2563eb' : '#1f2937',
              fontSize: '0.9rem'
            }}
          >
            {day}
          </div>
          {dayEvents.slice(0, 2).map((event, idx) => (
            <div
              key={event.id}
              style={{
                fontSize: '0.65rem',
                padding: '0.15rem 0.35rem',
                marginBottom: '0.15rem',
                borderRadius: '3px',
                background: getTypeColor(event.type),
                color: 'white',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={event.title}
            >
              {event.title}
            </div>
          ))}
          {dayEvents.length > 2 && (
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.15rem' }}>
              +{dayEvents.length - 2} more
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          background: '#e5e7eb'
        }}
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            style={{
              padding: '0.75rem',
              fontWeight: '600',
              textAlign: 'center',
              background: '#f9fafb',
              color: '#64748b'
            }}
          >
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderListView = () => {
    const sortedEvents = [...filteredEvents].sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    return (
      <div style={{ padding: '1rem' }}>
        {sortedEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <CalendarIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No events found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sortedEvents.map(event => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                style={{
                  border: '1px solid #e5e7eb',
                  borderLeft: `4px solid ${getTypeColor(event.type)}`,
                  borderRadius: '8px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: 'white'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: '600' }}>
                      {event.title}
                    </h3>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      📅 {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      {event.time && ` at ${event.time}`}
                    </div>
                    {event.location && (
                      <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
                        📍 {event.location}
                      </div>
                    )}
                    {event.description && (
                      <p style={{ margin: '0.5rem 0 0 0', color: '#475569' }}>
                        {event.description}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: getTypeColor(event.type) + '20',
                      color: getTypeColor(event.type),
                      marginLeft: '1rem'
                    }}
                  >
                    {event.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', overflow: 'visible', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => changeMonth(-1)}
              style={{
                background: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
              {monthNames[selectedMonth]} {selectedYear}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              style={{
                background: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={goToToday}
              style={{
                background: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Today
            </button>
            <button
              onClick={() => setView(view === 'month' ? 'list' : 'month')}
              style={{
                background: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {view === 'month' ? 'List View' : 'Month View'}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: showFilters ? '#3b82f6' : 'transparent',
                color: showFilters ? 'white' : '#64748b',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div style={{ 
            padding: '1rem', 
            background: '#f8fafc', 
            borderRadius: '8px',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1 1 300px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                Search Events
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search by title, description, location..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <div style={{ flex: '0 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                Event Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={() => setFilters({ type: 'all', search: '' })}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
          <span>Total Events: {filteredEvents.length}</span>
          {filters.type !== 'all' && <span>• Filtered by: {eventTypes.find(t => t.value === filters.type)?.label}</span>}
          {filters.search && <span>• Search: "{filters.search}"</span>}
        </div>
      </div>

      {/* Calendar Content */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Loading events...
        </div>
      ) : (
        view === 'month' ? renderMonthView() : renderListView()
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          onClick={() => setSelectedEvent(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
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
              maxHeight: '80vh',
              overflow: 'auto'
            }}
          >
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem', fontWeight: '600' }}>
                    {selectedEvent.title}
                  </h2>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: getTypeColor(selectedEvent.type) + '20',
                      color: getTypeColor(selectedEvent.type)
                    }}
                  >
                    {selectedEvent.type}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    color: '#64748b'
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '1rem', color: '#475569', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CalendarIcon size={20} />
                  <strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  {selectedEvent.time && ` at ${selectedEvent.time}`}
                </div>
                {selectedEvent.location && (
                  <div style={{ fontSize: '1rem', color: '#475569', marginBottom: '0.75rem' }}>
                    <strong>Location:</strong> {selectedEvent.location}
                  </div>
                )}
                {selectedEvent.description && (
                  <div style={{ fontSize: '1rem', color: '#475569', marginTop: '1rem' }}>
                    <strong>Description:</strong>
                    <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>{selectedEvent.description}</p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                <button
                  onClick={() => exportToGoogleCalendar(selectedEvent)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Download size={16} />
                  Add to Google Calendar
                </button>
                <button
                  onClick={() => exportToICS(selectedEvent)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    color: '#3b82f6',
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Download size={16} />
                  Download .ics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
