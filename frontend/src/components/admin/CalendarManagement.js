import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function CalendarManagement() {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const token = localStorage.getItem('token');

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    end_time: '',
    location: '',
    type: 'event',
    capacity: null,
    price: 0,
    category: 'other',
    recurring: false,
    recurrence_frequency: 'weekly',
    recurrence_end_date: '',
    recurrence_days: []
  });

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const fetchCalendarEvents = async () => {
    try {
      const response = await axios.get(`${API}/calendar-events`);
      setCalendarEvents(response.data);
    } catch (error) {
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      if (editingEvent) {
        await axios.put(`${API}/admin/calendar-events/${editingEvent.id}`, eventForm, { headers });
        toast.success('Calendar event updated successfully');
      } else {
        // Use recurring endpoint if recurring is enabled
        const endpoint = eventForm.recurring ? `${API}/events/recurring` : `${API}/admin/calendar-events`;
        const payload = eventForm.recurring ? {
          title: eventForm.title,
          description: eventForm.description,
          start_date: eventForm.date,
          start_time: eventForm.time,
          end_time: eventForm.end_time || eventForm.time,
          location: eventForm.location,
          recurring: true,
          recurrence_frequency: eventForm.recurrence_frequency,
          recurrence_end_date: eventForm.recurrence_end_date,
          recurrence_days: eventForm.recurrence_days,
          capacity: eventForm.capacity,
          price: eventForm.price || 0,
          category: eventForm.category
        } : eventForm;
        
        const response = await axios.post(endpoint, payload, { headers });
        
        if (eventForm.recurring && response.data.count) {
          toast.success(`Created ${response.data.count} recurring event instances!`);
        } else {
          toast.success('Calendar event created successfully');
        }
      }
      
      setShowDialog(false);
      setEditingEvent(null);
      setEventForm({ 
        title: '', description: '', date: '', time: '', end_time: '', location: '', 
        type: 'event', capacity: null, price: 0, category: 'other',
        recurring: false, recurrence_frequency: 'weekly', recurrence_end_date: '', recurrence_days: []
      });
      fetchCalendarEvents();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time || '',
      location: event.location || '',
      type: event.type
    });
    setShowDialog(true);
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this calendar event?')) return;
    
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API}/admin/calendar-events/${eventId}`, { headers });
      toast.success('Calendar event deleted successfully');
      fetchCalendarEvents();
    } catch (error) {
      toast.error('Failed to delete calendar event');
    }
  };

  const getEventTypeColor = (type) => {
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Calendar Events Management</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button data-testid="add-calendar-event">
              <Plus size={20} style={{ marginRight: '0.5rem' }} />
              Add Calendar Event
            </Button>
          </DialogTrigger>
          <DialogContent style={{ maxWidth: '600px' }}>
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Edit Calendar Event' : 'Create Calendar Event'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                  placeholder="e.g., Main Gymnasium, Court A"
                />
              </div>
              
              {/* Recurring Event Section */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={eventForm.recurring}
                    onChange={(e) => setEventForm({...eventForm, recurring: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="recurring" className="cursor-pointer font-semibold">
                    Recurring Event
                  </Label>
                </div>
                
                {eventForm.recurring && (
                  <div className="space-y-3 pl-6 border-l-2 border-blue-200">
                    <div>
                      <Label>Frequency *</Label>
                      <select
                        value={eventForm.recurrence_frequency}
                        onChange={(e) => setEventForm({...eventForm, recurrence_frequency: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                        required
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    {eventForm.recurrence_frequency === 'weekly' && (
                      <div>
                        <Label>Repeat on Days *</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <label key={day} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded cursor-pointer hover:bg-gray-200">
                              <input
                                type="checkbox"
                                checked={eventForm.recurrence_days.includes(day)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEventForm({...eventForm, recurrence_days: [...eventForm.recurrence_days, day]});
                                  } else {
                                    setEventForm({...eventForm, recurrence_days: eventForm.recurrence_days.filter(d => d !== day)});
                                  }
                                }}
                              />
                              <span className="text-sm">{day.slice(0, 3)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <Label>End Date *</Label>
                      <Input
                        type="date"
                        value={eventForm.recurrence_end_date}
                        onChange={(e) => setEventForm({...eventForm, recurrence_end_date: e.target.value})}
                        min={eventForm.date}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Events will be created until this date
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select value={eventForm.type} onValueChange={(value) => setEventForm({...eventForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="program">Program</SelectItem>
                    <SelectItem value="tournament">Tournament</SelectItem>
                    <SelectItem value="camp">Camp</SelectItem>
                    <SelectItem value="clinic">Clinic</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button type="submit">{editingEvent ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {calendarEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            No calendar events yet. Create your first one!
          </div>
        ) : (
          calendarEvents
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map((event) => (
              <div
                key={event.id}
                data-testid={`calendar-event-${event.id}`}
                style={{
                  padding: '1.5rem',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e8eeff',
                  borderLeft: `4px solid ${getEventTypeColor(event.type)}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b' }}>{event.title}</h3>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: getEventTypeColor(event.type),
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {event.type}
                      </span>
                    </div>
                    {event.description && (
                      <p style={{ color: '#64748b', marginBottom: '0.75rem' }}>{event.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                      <span>📅 {event.date}</span>
                      {event.time && <span>🕐 {event.time}</span>}
                      {event.location && <span>📍 {event.location}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(event)}
                      data-testid={`edit-calendar-event-${event.id}`}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                      data-testid={`delete-calendar-event-${event.id}`}
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

export default CalendarManagement;