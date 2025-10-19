import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HelpCircle, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function FAQManagement() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    order: 0,
    is_published: true
  });
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await axios.get(`${API}/admin/faqs/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFaqs(response.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingFaq) {
        // Update existing FAQ
        await axios.put(`${API}/admin/faqs/${editingFaq.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('FAQ updated successfully!');
      } else {
        // Create new FAQ
        await axios.post(`${API}/admin/faqs`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('FAQ created successfully!');
      }
      
      setShowDialog(false);
      resetForm();
      fetchFAQs();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save FAQ');
    }
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      is_published: faq.is_published
    });
    setShowDialog(true);
  };

  const handleDelete = async (faqId) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }
    
    try {
      await axios.delete(`${API}/admin/faqs/${faqId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('FAQ deleted successfully');
      fetchFAQs();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete FAQ');
    }
  };

  const handleTogglePublish = async (faq) => {
    try {
      await axios.put(`${API}/admin/faqs/${faq.id}`, {
        is_published: !faq.is_published
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`FAQ ${!faq.is_published ? 'published' : 'unpublished'}`);
      fetchFAQs();
    } catch (error) {
      toast.error('Failed to update FAQ status');
    }
  };

  const resetForm = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      order: 0,
      is_published: true
    });
  };

  const handleDialogClose = (open) => {
    setShowDialog(open);
    if (!open) {
      resetForm();
    }
  };

  const groupedFaqs = faqs.reduce((acc, faq) => {
    const category = faq.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {});

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <CardTitle>FAQ Management</CardTitle>
              <CardDescription>Add, edit, delete and manage frequently asked questions</CardDescription>
            </div>
            <Button onClick={() => setShowDialog(true)}>
              <Plus size={16} style={{ marginRight: '0.5rem' }} />
              Add FAQ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>{faqs.length}</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total FAQs</div>
            </div>
            <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#16a34a' }}>
                {faqs.filter(f => f.is_published).length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Published</div>
            </div>
            <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#d97706' }}>
                {faqs.filter(f => !f.is_published).length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Draft</div>
            </div>
            <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
                {Object.keys(groupedFaqs).length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQs by Category */}
      {Object.keys(groupedFaqs).length === 0 ? (
        <Card>
          <CardContent style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <HelpCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ marginBottom: '1rem' }}>No FAQs created yet</p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus size={16} style={{ marginRight: '0.5rem' }} />
              Create First FAQ
            </Button>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>{categoryFaqs.length} question(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {categoryFaqs.sort((a, b) => a.order - b.order).map((faq) => (
                  <div
                    key={faq.id}
                    style={{
                      padding: '1.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      background: faq.is_published ? 'white' : '#fef3c7'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: '#f1f5f9',
                            color: '#64748b'
                          }}>
                            #{faq.order}
                          </span>
                          {!faq.is_published && (
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: '#fef3c7',
                              color: '#d97706'
                            }}>
                              Draft
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.75rem' }}>
                          {faq.question}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
                          {faq.answer}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <Button
                          onClick={() => handleTogglePublish(faq)}
                          variant="outline"
                          size="sm"
                          title={faq.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {faq.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                        <Button onClick={() => handleEdit(faq)} variant="outline" size="sm">
                          <Edit size={16} />
                        </Button>
                        <Button
                          onClick={() => handleDelete(faq.id)}
                          variant="outline"
                          size="sm"
                          style={{ color: '#dc2626' }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={handleDialogClose}>
        <DialogContent style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Create New FAQ'}</DialogTitle>
            <DialogDescription>
              {editingFaq ? 'Update the FAQ details' : 'Add a new frequently asked question'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                placeholder="Enter the question..."
                value={formData.question}
                onChange={(e) => handleInputChange('question', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                placeholder="Enter the detailed answer..."
                value={formData.answer}
                onChange={(e) => handleInputChange('answer', e.target.value)}
                rows={6}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., General, Membership, Events"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Checkbox
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => handleInputChange('is_published', checked)}
              />
              <Label htmlFor="is_published" style={{ margin: 0, cursor: 'pointer' }}>
                Publish immediately
              </Label>
            </div>

            <div style={{
              background: '#f1f5f9',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: '#475569'
            }}>
              <strong>Tip:</strong> Use the order number to control the display sequence. Lower numbers appear first.
              Unpublished FAQs are saved as drafts and won't be visible to users.
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button type="button" onClick={() => handleDialogClose(false)} variant="outline">
                Cancel
              </Button>
              <Button type="submit">
                {editingFaq ? 'Update FAQ' : 'Create FAQ'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FAQManagement;
