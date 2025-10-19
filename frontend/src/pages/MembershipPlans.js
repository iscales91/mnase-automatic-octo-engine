import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const MembershipPlans = () => {
  const navigate = useNavigate();
  const [pricing, setPricing] = useState(null);
  const [membershipType, setMembershipType] = useState('individual');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [myMemberships, setMyMemberships] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch pricing
      const pricingRes = await fetch(`${API_BASE_URL}/api/memberships/pricing`);
      const pricingData = await pricingRes.json();
      setPricing(pricingData);

      // Fetch user's memberships if logged in
      const token = localStorage.getItem('token');
      if (token) {
        const myMemRes = await fetch(`${API_BASE_URL}/api/memberships/my-memberships`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (myMemRes.ok) {
          const myMemData = await myMemRes.json();
          setMyMemberships(myMemData);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSelectMembership = async (tier) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to purchase a membership');
      return;
    }

    try {
      setLoading(true);
      
      // Create membership
      const response = await fetch(`${API_BASE_URL}/api/memberships`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          membership_type: membershipType,
          tier: tier,
          billing_cycle: billingCycle
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create membership');
      }

      const membership = await response.json();

      // Create checkout session
      const checkoutRes = await fetch(
        `${API_BASE_URL}/api/memberships/${membership.id}/checkout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ origin_url: window.location.origin })
        }
      );

      const checkoutData = await checkoutRes.json();
      
      // Redirect to Stripe checkout
      window.location.href = checkoutData.checkout_url;
      
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process membership purchase');
      setLoading(false);
    }
  };

  if (loading || !pricing) {
    return <div className="p-8 text-center">Loading membership plans...</div>;
  }

  const currentPricing = pricing[membershipType];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Membership Plans</h1>
          <p className="text-xl text-gray-600">Choose the perfect plan for your basketball journey</p>
        </div>

        {/* My Active Memberships */}
        {myMemberships.length > 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Your Active Memberships</h3>
            {myMemberships.map(membership => (
              <div key={membership.id} className="text-sm">
                {membership.tier} {membership.membership_type} ({membership.status})
              </div>
            ))}
          </div>
        )}

        {/* Membership Type Selector */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => setMembershipType('individual')}
            className={membershipType === 'individual' ? 'bg-blue-600' : 'bg-gray-300'}
          >
            Individual Membership
          </Button>
          <Button
            onClick={() => setMembershipType('team')}
            className={membershipType === 'team' ? 'bg-blue-600' : 'bg-gray-300'}
          >
            Team Membership
          </Button>
        </div>

        {/* Billing Cycle Selector */}
        <div className="flex justify-center gap-4 mb-12">
          <Button
            onClick={() => setBillingCycle('monthly')}
            className={billingCycle === 'monthly' ? 'bg-green-600' : 'bg-gray-300'}
          >
            Monthly Billing
          </Button>
          <Button
            onClick={() => setBillingCycle('annual')}
            className={billingCycle === 'annual' ? 'bg-green-600' : 'bg-gray-300'}
          >
            Annual Billing (Save 17%)
          </Button>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 px-4">
          {Object.entries(currentPricing).map(([tier, data]) => (
            <div
              key={tier}
              className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                tier === 'premium' ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {tier === 'premium' && (
                <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2 capitalize">{tier}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${data[billingCycle]}</span>
                  <span className="text-gray-600">/{billingCycle === 'monthly' ? 'mo' : 'year'}</span>
                </div>

                {membershipType === 'team' && data.team_size && (
                  <div className="mb-4 text-sm text-gray-600">
                    Up to {data.team_size} players
                  </div>
                )}

                <Button
                  onClick={() => handleSelectMembership(tier)}
                  className="w-full mb-6"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Select Plan'}
                </Button>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase text-gray-600">Benefits:</h4>
                  {data.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-4">Membership Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Flexible Billing</h3>
              <p className="text-gray-600">Choose monthly or annual billing with auto-renewal options</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Cancel Anytime</h3>
              <p className="text-gray-600">No long-term commitments - cancel anytime from your dashboard</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Family Friendly</h3>
              <p className="text-gray-600">Special rates for families and youth programs</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Community Access</h3>
              <p className="text-gray-600">Join a community of basketball enthusiasts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipPlans;
