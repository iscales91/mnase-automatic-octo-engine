import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Calendar() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [selectedMonth, selectedYear]);

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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDate = (day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const changeMonth = (direction) => {
    let newMonth = selectedMonth + direction;
    let newYear = selectedYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ padding: '0.5rem' }} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const isToday = 
        day === currentDate.getDate() &&
        selectedMonth === currentDate.getMonth() &&
        selectedYear === currentDate.getFullYear();

      days.push(
        <div
          key={day}
          data-testid={`calendar-day-${day}`}
          style={{
            padding: '0.5rem',
            border: '1px solid #e8eeff',
            borderRadius: '8px',
            minHeight: '80px',
            background: isToday ? 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)' : 'white',
            cursor: dayEvents.length > 0 ? 'pointer' : 'default',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (dayEvents.length > 0) {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ 
            fontWeight: isToday ? '700' : '600', 
            marginBottom: '0.25rem',
            color: isToday ? '#dc2626' : '#1e293b',
            fontSize: '0.9rem'
          }}>
            {day}
          </div>
          {dayEvents.map((event, idx) => (
            <div
              key={idx}
              data-testid={`event-${event.id}`}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                background: getEventColor(event.type),
                borderRadius: '4px',
                marginTop: '0.25rem',
                color: 'white',
                fontWeight: '600',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={`${event.title}\n${event.time || ''}\n${event.location || ''}`}
            >
              {event.title}
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  const getEventColor = (type) => {
    const colors = {
      'program': '#dc2626',
      'tournament': '#f97316',
      'camp': '#eab308',
      'clinic': '#84cc16',
      'workshop': '#06b6d4',
      'event': '#8b5cf6',
      'other': '#64748b'
    };
    return colors[type] || colors['other'];
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📅</div>
        <div>Loading calendar...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Calendar Grid */}
        <div>
          {/* Calendar Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '12px'
          }}>
            <button
              onClick={() => changeMonth(-1)}
              data-testid="prev-month"
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: '600'
              }}
            >
              ←
            </button>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'white' }}>
              {monthNames[selectedMonth]} {selectedYear}
            </h3>
            <button
              onClick={() => changeMonth(1)}
              data-testid="next-month"
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: '600'
              }}
            >
              →
            </button>
          </div>

          {/* Days of Week */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{ 
                textAlign: 'center', 
                fontWeight: '700', 
                color: '#64748b',
                padding: '0.5rem'
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem'
          }}>
            {renderCalendar()}
          </div>

          {/* Legend */}
          <div style={{ 
            marginTop: '2rem', 
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)',
            borderRadius: '12px'
          }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#1e293b' }}>Event Types</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {['program', 'tournament', 'camp', 'clinic', 'workshop', 'event'].map(type => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '4px',
                    background: getEventColor(type)
                  }} />
                  <span style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'capitalize' }}>{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events Sidebar */}
        <div>
          <div style={{ 
            padding: '1.5rem',
            background: 'white',
            borderRadius: '12px',
            border: '2px solid #e8eeff',
            position: 'sticky',
            top: '2rem'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b' }}>
              Upcoming Events
            </h3>
            {getUpcomingEvents().length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>
                No upcoming events scheduled
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {getUpcomingEvents().map((event, idx) => (
                  <div 
                    key={idx}
                    data-testid={`upcoming-event-${idx}`}
                    style={{ 
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${getEventColor(event.type)}`
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                      {event.title}
                    </div>
                    {event.time && (
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        ⏰ {event.time}
                      </div>
                    )}
                    {event.location && (
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        📍 {event.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
