import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, Send, DollarSign, Calendar } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function BillingInvoices({ token }) {
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    user_id: '',
    items: [{ name: '', description: '', amount: 0, quantity: 1 }],
    subtotal: 0,
    tax: 0,
    total: 0,
    due_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [invoicesRes, usersRes, programsRes] = await Promise.all([
        axios.get(`${API}/admin/invoices`, { headers }),
        axios.get(`${API}/admin/users`, { headers }),
        axios.get(`${API}/programs`)
      ]);
      setInvoices(invoicesRes.data);
      setUsers(usersRes.data);
      setPrograms(programsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (items, tax) => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
    const total = subtotal + (subtotal * (tax / 100));
    return { subtotal, total };
  };

  const handleAddItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { name: '', description: '', amount: 0, quantity: 1 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = invoiceForm.items.filter((_, i) => i !== index);
    const { subtotal, total } = calculateTotals(newItems, invoiceForm.tax);
    setInvoiceForm({ ...invoiceForm, items: newItems, subtotal, total });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceForm.items];
    newItems[index][field] = field === 'amount' || field === 'quantity' ? parseFloat(value) || 0 : value;
    const { subtotal, total } = calculateTotals(newItems, invoiceForm.tax);
    setInvoiceForm({ ...invoiceForm, items: newItems, subtotal, total });
  };

  const handleTaxChange = (value) => {
    const tax = parseFloat(value) || 0;
    const { subtotal, total } = calculateTotals(invoiceForm.items, tax);
    setInvoiceForm({ ...invoiceForm, tax, subtotal, total });
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API}/admin/invoices`, invoiceForm, { headers });
      toast.success('Invoice created successfully');
      setShowCreateDialog(false);
      setInvoiceForm({
        user_id: '',
        items: [{ name: '', description: '', amount: 0, quantity: 1 }],
        subtotal: 0,
        tax: 0,
        total: 0,
        due_date: '',
        notes: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create invoice');
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId, status) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/admin/invoices/${invoiceId}/status?status=${status}`, {}, { headers });
      toast.success(`Invoice ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update invoice');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: '#9ca3af',
      sent: '#3b82f6',
      paid: '#10b981',
      overdue: '#ef4444',
      cancelled: '#6b7280'
    };
    return colors[status] || '#9ca3af';
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading invoices...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '600' }}>Billing & Invoices</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button data-testid="create-invoice-btn">
              <Plus size={18} style={{ marginRight: '0.5rem' }} />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent style={{ maxWidth: '700px' }} data-testid="create-invoice-dialog">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>Generate an invoice for a user</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <Label>User</Label>
                <Select
                  value={invoiceForm.user_id}
                  onValueChange={(value) => setInvoiceForm({...invoiceForm, user_id: value})}
                  required
                >
                  <SelectTrigger data-testid="invoice-user-select">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Label>Invoice Items</Label>
                  <Button type="button" size="sm" variant="outline" onClick={handleAddItem} data-testid="add-invoice-item-btn">
                    <Plus size={14} style={{ marginRight: '0.25rem' }} /> Add Item
                  </Button>
                </div>
                {invoiceForm.items.map((item, index) => (
                  <div key={index} style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        required
                        data-testid={`item-name-${index}`}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                        required
                        data-testid={`item-amount-${index}`}
                      />
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        required
                        data-testid={`item-quantity-${index}`}
                      />
                    </div>
                    <Input
                      placeholder="Description (optional)"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      data-testid={`item-description-${index}`}
                    />
                    {invoiceForm.items.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveItem(index)}
                        style={{ marginTop: '0.5rem' }}
                        data-testid={`remove-item-${index}`}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <Label>Tax (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={invoiceForm.tax}
                    onChange={(e) => handleTaxChange(e.target.value)}
                    data-testid="invoice-tax-input"
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={invoiceForm.due_date}
                    onChange={(e) => setInvoiceForm({...invoiceForm, due_date: e.target.value})}
                    data-testid="invoice-due-date-input"
                  />
                </div>
              </div>

              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
                  placeholder="Additional notes or payment instructions"
                  data-testid="invoice-notes-input"
                />
              </div>

              <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Subtotal:</span>
                  <strong data-testid="invoice-subtotal">${invoiceForm.subtotal.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                  <span>Tax ({invoiceForm.tax}%):</span>
                  <span data-testid="invoice-tax-amount">${(invoiceForm.subtotal * (invoiceForm.tax / 100)).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '700', paddingTop: '0.5rem', borderTop: '2px solid #cbd5e1' }}>
                  <span>Total:</span>
                  <span data-testid="invoice-total">${invoiceForm.total.toFixed(2)}</span>
                </div>
              </div>

              <Button type="submit" className="w-full" data-testid="submit-invoice-btn">Create Invoice</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>No invoices created yet</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Invoice #</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>User</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Amount</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Due Date</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const user = users.find(u => u.id === invoice.user_id);
                  return (
                    <tr key={invoice.id} style={{ borderBottom: '1px solid #f3f4f6' }} data-testid={`invoice-row-${invoice.id}`}>
                      <td style={{ padding: '0.75rem', fontWeight: '600' }} data-testid={`invoice-number-${invoice.id}`}>
                        {invoice.invoice_number}
                      </td>
                      <td style={{ padding: '0.75rem' }} data-testid={`invoice-user-${invoice.id}`}>
                        {user?.name || 'Unknown'}
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: '600', color: '#1e40af' }} data-testid={`invoice-amount-${invoice.id}`}>
                        ${invoice.total.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#64748b' }} data-testid={`invoice-due-${invoice.id}`}>
                        {invoice.due_date || 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            background: `${getStatusColor(invoice.status)}20`,
                            color: getStatusColor(invoice.status)
                          }}
                          data-testid={`invoice-status-${invoice.id}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {invoice.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateInvoiceStatus(invoice.id, 'sent')}
                              data-testid={`send-invoice-${invoice.id}`}
                            >
                              <Send size={14} style={{ marginRight: '0.25rem' }} /> Send
                            </Button>
                          )}
                          {invoice.status === 'sent' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateInvoiceStatus(invoice.id, 'paid')}
                              data-testid={`mark-paid-${invoice.id}`}
                            >
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default BillingInvoices;