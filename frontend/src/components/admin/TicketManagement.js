import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Ticket, Plus, DollarSign, Users, TrendingUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function TicketManagement() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity_available: '',
    has_seat_numbers: false,
    seat_numbers: '',
    sale_start: '',
    sale_end: '',
    max_per_order: '10'
  });
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchTicketTypes(selectedEvent.id);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data);
      if (response.data.length > 0) {
        setSelectedEvent(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketTypes = async (eventId) => {
    try {
      const response = await axios.get(`${API}/tickets/event/${eventId}`);
      setTicketTypes(response.data.ticket_types || []);
    } catch (error) {
      console.error('Error fetching ticket types:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    
    if (!selectedEvent) {
      toast.error('Please select an event');
      return;
    }

    try {
      const seatNumbers = formData.has_seat_numbers 
        ? formData.seat_numbers.split(',').map(s => s.trim()).filter(s => s)
        : [];

      const payload = {
        event_id: selectedEvent.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity_available: parseInt(formData.quantity_available),
        has_seat_numbers: formData.has_seat_numbers,
        seat_numbers: seatNumbers,
        sale_start: formData.sale_start || null,
        sale_end: formData.sale_end || null,
        max_per_order: parseInt(formData.max_per_order)
      };

      await axios.post(`${API}/admin/tickets/create-type`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Ticket type created successfully!');
      setShowCreateDialog(false);
      resetForm();
      fetchTicketTypes(selectedEvent.id);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create ticket type');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      quantity_available: '',
      has_seat_numbers: false,
      seat_numbers: '',
      sale_start: '',
      sale_end: '',
      max_per_order: '10'
    });
  };

  const getTicketStats = () => {
    const totalTypes = ticketTypes.length;
    const totalAvailable = ticketTypes.reduce((sum, t) => sum + (t.quantity_available || 0), 0);
    const totalSold = ticketTypes.reduce((sum, t) => sum + (t.quantity_sold || 0), 0);
    const totalRevenue = ticketTypes.reduce((sum, t) => sum + ((t.quantity_sold || 0) * (t.price || 0)), 0);

    return { totalTypes, totalAvailable, totalSold, totalRevenue };
  };

  const stats = getTicketStats();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Event Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Event</CardTitle>
          <CardDescription>Choose an event to manage tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={selectedEvent?.id || ''}
              onChange={(e) => {
                const event = events.find(ev => ev.id === e.target.value);
                setSelectedEvent(event);
              }}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            >
              <option value="">Select an event...</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} - {new Date(event.date).toLocaleDateString()}
                </option>
              ))}
            </select>
            <Button onClick={() => setShowCreateDialog(true)} disabled={!selectedEvent}>
              <Plus size={16} style={{ marginRight: '0.5rem' }} />
              Create Ticket Type
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedEvent && (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <Card>
              <CardContent style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Ticket Types</span>
                  <Ticket size={20} color="#3b82f6" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
                  {stats.totalTypes}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Available</span>
                  <Users size={20} color="#10b981" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
                  {stats.totalAvailable - stats.totalSold}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Sold</span>
                  <TrendingUp size={20} color="#f59e0b" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
                  {stats.totalSold}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Revenue</span>
                  <DollarSign size={20} color="#8b5cf6" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
                  ${stats.totalRevenue.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Types Table */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Types for {selectedEvent.title}</CardTitle>
              <CardDescription>Manage admission tickets for this event</CardDescription>
            </CardHeader>
            <CardContent>
              {ticketTypes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <Ticket size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No ticket types created yet</p>
                  <Button onClick={() => setShowCreateDialog(true)} style={{ marginTop: '1rem' }}>
                    <Plus size={16} style={{ marginRight: '0.5rem' }} />
                    Create First Ticket Type
                  </Button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Type
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Price
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Available
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Sold
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Seats
                        </th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticketTypes.map((ticket) => (
                        <tr key={ticket.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{ticket.name}</div>
                            {ticket.description && (
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ticket.description}</div>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right', fontWeight: '600' }}>
                            ${ticket.price.toFixed(2)}
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right' }}>
                            {ticket.quantity_available - ticket.quantity_sold}
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right' }}>
                            {ticket.quantity_sold}
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'center' }}>
                            {ticket.has_seat_numbers ? (
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                background: '#dbeafe',
                                color: '#1e40af'
                              }}>
                                VIP
                              </span>
                            ) : (
                              <span style={{ color: '#64748b' }}>General</span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: ticket.status === 'active' ? '#dcfce7' : ticket.status === 'sold_out' ? '#fef3c7' : '#f1f5f9',
                              color: ticket.status === 'active' ? '#16a34a' : ticket.status === 'sold_out' ? '#d97706' : '#64748b'
                            }}>
                              {ticket.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
          <DialogHeader>
            <DialogTitle>Create Ticket Type</DialogTitle>
            <DialogDescription>
              Create a new ticket type for {selectedEvent?.title}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <Label htmlFor="name">Ticket Name *</Label>
              <Input
                id="name"
                placeholder="e.g., General Admission, VIP, Student"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this ticket type"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={2}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="quantity_available">Quantity *</Label>
                <Input
                  id="quantity_available"
                  type="number"
                  min="1"
                  placeholder="100"
                  value={formData.quantity_available}
                  onChange={(e) => handleInputChange('quantity_available', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="max_per_order">Max Per Order</Label>
              <Input
                id="max_per_order"
                type="number"
                min="1"
                placeholder="10"
                value={formData.max_per_order}
                onChange={(e) => handleInputChange('max_per_order', e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Checkbox
                id="has_seat_numbers"
                checked={formData.has_seat_numbers}
                onCheckedChange={(checked) => handleInputChange('has_seat_numbers', checked)}
              />
              <Label htmlFor="has_seat_numbers" style={{ margin: 0, cursor: 'pointer' }}>
                VIP Tickets with Seat Numbers
              </Label>
            </div>

            {formData.has_seat_numbers && (
              <div>
                <Label htmlFor="seat_numbers">Seat Numbers *</Label>
                <Textarea
                  id="seat_numbers"
                  placeholder="Enter seat numbers separated by commas (e.g., A1, A2, A3, B1, B2)"
                  value={formData.seat_numbers}
                  onChange={(e) => handleInputChange('seat_numbers', e.target.value)}
                  rows={3}
                  required={formData.has_seat_numbers}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Separate seat numbers with commas
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <Label htmlFor="sale_start">Sale Start (Optional)</Label>
                <Input
                  id="sale_start"
                  type="datetime-local"
                  value={formData.sale_start}
                  onChange={(e) => handleInputChange('sale_start', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="sale_end">Sale End (Optional)</Label>
                <Input
                  id="sale_end"
                  type="datetime-local"
                  value={formData.sale_end}
                  onChange={(e) => handleInputChange('sale_end', e.target.value)}
                />
              </div>
            </div>

            <div style={{
              background: '#f1f5f9',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: '#475569'
            }}>
              <strong>Note:</strong> Once created, ticket types cannot be deleted if any tickets have been sold.
              Make sure all information is correct before creating.
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button type="button" onClick={() => setShowCreateDialog(false)} variant="outline">
                Cancel
              </Button>
              <Button type="submit">
                Create Ticket Type
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TicketManagement;
