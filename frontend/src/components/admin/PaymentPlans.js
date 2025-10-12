import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function PaymentPlans({ token }) {
  const [paymentPlans, setPaymentPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [planForm, setPlanForm] = useState({
    user_id: '',
    program_id: '',
    total_amount: 0,
    num_installments: 3,
    frequency: 'monthly',
    first_payment_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [plansRes, usersRes, programsRes] = await Promise.all([
        axios.get(`${API}/admin/payment-plans`, { headers }),
        axios.get(`${API}/admin/users`, { headers }),
        axios.get(`${API}/programs`)
      ]);
      setPaymentPlans(plansRes.data);
      setUsers(usersRes.data);
      setPrograms(programsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanTransactions = async (planId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API}/admin/payment-plans/${planId}/transactions`, { headers });
      setTransactions(response.data);
      setSelectedPlan(planId);
    } catch (error) {
      toast.error('Failed to load transactions');
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API}/admin/payment-plans`, planForm, { headers });
      toast.success('Payment plan created successfully');
      setShowCreateDialog(false);
      setPlanForm({
        user_id: '',
        program_id: '',
        total_amount: 0,
        num_installments: 3,
        frequency: 'monthly',
        first_payment_date: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create payment plan');
    }
  };

  const handleMarkPaid = async (transactionId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/admin/payment-plan-transactions/${transactionId}/mark-paid`, {}, { headers });
      toast.success('Payment marked as paid');
      fetchPlanTransactions(selectedPlan);
      fetchData();
    } catch (error) {
      toast.error('Failed to mark payment as paid');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#3b82f6',
      completed: '#10b981',
      cancelled: '#6b7280',
      defaulted: '#ef4444'
    };
    return colors[status] || '#9ca3af';
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading payment plans...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '600' }}>Payment Plans</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button data-testid="create-plan-btn">
              <Plus size={18} style={{ marginRight: '0.5rem' }} />
              Create Payment Plan
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="create-plan-dialog">
            <DialogHeader>
              <DialogTitle>Create Payment Plan</DialogTitle>
              <DialogDescription>Set up an installment plan for a user</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <Label>User</Label>
                <Select
                  value={planForm.user_id}
                  onValueChange={(value) => setPlanForm({...planForm, user_id: value})}
                  required
                >
                  <SelectTrigger data-testid="plan-user-select">
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
                <Label>Program (Optional)</Label>
                <Select
                  value={planForm.program_id}
                  onValueChange={(value) => {
                    const program = programs.find(p => p.id === value);
                    setPlanForm({...planForm, program_id: value, total_amount: program?.price || 0});
                  }}
                >
                  <SelectTrigger data-testid="plan-program-select">
                    <SelectValue placeholder="Select program (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {programs.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} - ${p.price}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <Label>Total Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={planForm.total_amount}
                    onChange={(e) => setPlanForm({...planForm, total_amount: parseFloat(e.target.value) || 0})}
                    required
                    data-testid="plan-amount-input"
                  />
                </div>
                <div>
                  <Label>Number of Installments</Label>
                  <Input
                    type="number"
                    min="2"
                    max="12"
                    value={planForm.num_installments}
                    onChange={(e) => setPlanForm({...planForm, num_installments: parseInt(e.target.value) || 3})}
                    required
                    data-testid="plan-installments-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={planForm.frequency}
                    onValueChange={(value) => setPlanForm({...planForm, frequency: value})}
                  >
                    <SelectTrigger data-testid="plan-frequency-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>First Payment Date</Label>
                  <Input
                    type="date"
                    value={planForm.first_payment_date}
                    onChange={(e) => setPlanForm({...planForm, first_payment_date: e.target.value})}
                    required
                    data-testid="plan-first-date-input"
                  />
                </div>
              </div>

              <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Installment Amount:</span>
                  <strong data-testid="installment-amount">
                    ${planForm.num_installments > 0 ? (planForm.total_amount / planForm.num_installments).toFixed(2) : '0.00'}
                  </strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {planForm.num_installments} payments of ${planForm.num_installments > 0 ? (planForm.total_amount / planForm.num_installments).toFixed(2) : '0.00'} ({planForm.frequency})
                </div>
              </div>

              <Button type="submit" className="w-full" data-testid="submit-plan-btn">Create Payment Plan</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {paymentPlans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>No payment plans created yet</p>
          </div>
        ) : (
          <div>
            {paymentPlans.map((plan) => {
              const user = users.find(u => u.id === plan.user_id);
              const program = programs.find(p => p.id === plan.program_id);
              
              return (
                <Card key={plan.id} style={{ marginBottom: '1rem' }} data-testid={`plan-card-${plan.id}`}>
                  <CardHeader>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <CardTitle data-testid={`plan-user-${plan.id}`}>{user?.name || 'Unknown User'}</CardTitle>
                        {program && (
                          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }} data-testid={`plan-program-${plan.id}`}>
                            {program.name}
                          </p>
                        )}
                      </div>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          background: `${getStatusColor(plan.status)}20`,
                          color: getStatusColor(plan.status)
                        }}
                        data-testid={`plan-status-${plan.id}`}
                      >
                        {plan.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Total Amount</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }} data-testid={`plan-total-${plan.id}`}>
                          ${plan.total_amount.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Installment Amount</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }} data-testid={`plan-installment-${plan.id}`}>
                          ${plan.installment_amount.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Progress</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }} data-testid={`plan-progress-${plan.id}`}>
                          {plan.payments_made} / {plan.num_installments}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Frequency</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600', textTransform: 'capitalize' }} data-testid={`plan-frequency-${plan.id}`}>
                          {plan.frequency}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchPlanTransactions(plan.id)}
                      data-testid={`view-transactions-${plan.id}`}
                    >
                      View Payment Schedule
                    </Button>

                    {selectedPlan === plan.id && transactions.length > 0 && (
                      <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                        <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>Payment Schedule</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {transactions.map((txn) => (
                            <div
                              key={txn.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem',
                                background: 'white',
                                borderRadius: '6px',
                                border: `1px solid ${txn.status === 'paid' ? '#10b981' : '#e5e7eb'}`
                              }}
                              data-testid={`transaction-${txn.id}`}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {txn.status === 'paid' ? (
                                  <CheckCircle size={20} style={{ color: '#10b981' }} />
                                ) : (
                                  <Calendar size={20} style={{ color: '#64748b' }} />
                                )}
                                <div>
                                  <div style={{ fontWeight: '600' }} data-testid={`txn-number-${txn.id}`}>
                                    Payment #{txn.installment_number}
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: '#64748b' }} data-testid={`txn-due-${txn.id}`}>
                                    Due: {txn.due_date}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem' }} data-testid={`txn-amount-${txn.id}`}>
                                  ${txn.amount.toFixed(2)}
                                </div>
                                {txn.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleMarkPaid(txn.id)}
                                    data-testid={`mark-paid-txn-${txn.id}`}
                                  >
                                    Mark Paid
                                  </Button>
                                )}
                                {txn.status === 'paid' && (
                                  <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>
                                    Paid
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentPlans;
