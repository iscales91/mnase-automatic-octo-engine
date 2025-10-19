import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Clock, Copy, ExternalLink, Calendar } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AffiliateEarningsDashboard() {
  const [loading, setLoading] = useState(true);
  const [affiliateData, setAffiliateData] = useState(null);
  const [sales, setSales] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAffiliateData();
    fetchSales();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      const response = await axios.get(`${API}/affiliates/my-account`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAffiliateData(response.data);
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await axios.get(`${API}/affiliates/my-sales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSales(response.data.sales || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const copyReferralLink = () => {
    const fullLink = `${window.location.origin}${affiliateData.referral_link}`;
    navigator.clipboard.writeText(fullLink);
    toast.success('Referral link copied to clipboard!');
  };

  const shareReferralLink = () => {
    const fullLink = `${window.location.origin}${affiliateData.referral_link}`;
    if (navigator.share) {
      navigator.share({
        title: 'MNASE Basketball Tickets',
        text: 'Get tickets to MNASE basketball events!',
        url: fullLink
      });
    } else {
      copyReferralLink();
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!affiliateData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not an Affiliate</CardTitle>
          <CardDescription>Apply to become an affiliate and start earning commissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/affiliate/apply">
            <Button>Apply Now</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const earnings = affiliateData.earnings || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Earnings Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <Card>
          <CardContent style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Total Earnings</span>
              <DollarSign size={20} color="#10b981" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
              ${(earnings.total_earnings || 0).toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              From {earnings.total_sales || 0} ticket sales
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Pending</span>
              <Clock size={20} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
              ${(earnings.pending_earnings || 0).toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Awaiting next payout
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Paid Out</span>
              <TrendingUp size={20} color="#3b82f6" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
              ${(earnings.paid_earnings || 0).toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Received to date
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Commission Rate</span>
              <TrendingUp size={20} color="#8b5cf6" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
              {((earnings.commission_rate || 0.15) * 100).toFixed(0)}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Per ticket sale
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>Share this link to earn commissions on ticket sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{
            display: 'flex',
            gap: '1rem',
            padding: '1rem',
            background: '#f8fafc',
            borderRadius: '8px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                Referral Code
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', fontFamily: 'monospace' }}>
                {affiliateData.referral_code}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button onClick={copyReferralLink} variant="outline" size="sm">
                <Copy size={16} style={{ marginRight: '0.5rem' }} />
                Copy Link
              </Button>
              <Button onClick={shareReferralLink} size="sm">
                <ExternalLink size={16} style={{ marginRight: '0.5rem' }} />
                Share
              </Button>
            </div>
          </div>
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#eff6ff',
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: '#1e40af'
          }}>
            💡 <strong>Pro Tip:</strong> Share this link on your social media, email signature, or anywhere your audience
            can see it. You'll earn 15% commission on every ticket purchase!
          </div>
        </CardContent>
      </Card>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Your latest ticket sales and commissions</CardDescription>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No sales yet. Share your referral link to start earning!</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                      Event
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                      Buyer
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                      Quantity
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                      Total
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                      Commission
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        {sale.event_title || 'Event'}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        {sale.buyer_email}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right' }}>
                        {sale.quantity}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right', fontWeight: '600' }}>
                        ${sale.total_amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right', fontWeight: '600', color: '#10b981' }}>
                        ${sale.commission_amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>
                        {new Date(sale.purchased_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout History */}
      {earnings.payouts && earnings.payouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
            <CardDescription>Your received payouts</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                      Payout Date
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                      Amount
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.payouts.map((payout, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        {new Date(payout.payout_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'right', fontWeight: '600' }}>
                        ${payout.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: payout.status === 'completed' ? '#dcfce7' : '#fef3c7',
                          color: payout.status === 'completed' ? '#16a34a' : '#d97706'
                        }}>
                          {payout.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Payout Info */}
      <Card style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: 'none' }}>
        <CardContent style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Calendar size={40} color="#3b82f6" />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                Next Payout: 1st of Next Month
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Pending earnings will be automatically transferred to your bank account via Stripe Connect
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AffiliateEarningsDashboard;
