import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function Shop() {
  const merchandise = [
    {
      name: 'MNASE Official Jersey',
      price: '$45.00',
      image: 'https://images.unsplash.com/photo-1508667827579-ffbf34b8f0dc?w=400&h=400&fit=crop',
      description: 'Official game jersey with MNASE logo. Available in black and red.'
    },
    {
      name: 'Training T-Shirt',
      price: '$25.00',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      description: 'Moisture-wicking performance tee perfect for training.'
    },
    {
      name: 'MNASE Hoodie',
      price: '$55.00',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
      description: 'Premium fleece hoodie with embroidered logo.'
    },
    {
      name: 'Basketball Shorts',
      price: '$30.00',
      image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop',
      description: 'Lightweight performance shorts with pockets.'
    },
    {
      name: 'MNASE Cap',
      price: '$22.00',
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop',
      description: 'Adjustable snapback cap with MNASE embroidery.'
    },
    {
      name: 'Training Basketball',
      price: '$35.00',
      image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400&h=400&fit=crop',
      description: 'Official size and weight training basketball.'
    },
    {
      name: 'Backpack',
      price: '$40.00',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      description: 'Durable backpack with ball compartment and MNASE logo.'
    },
    {
      name: 'Water Bottle',
      price: '$15.00',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop',
      description: 'Insulated 32oz water bottle with team branding.'
    }
  ];

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <img src="https://customer-assets.emergentagent.com/job_bball-league-hub/artifacts/tglx13e4_MNASE%20Logo%20Big" alt="MNASE Basketball" style={{ height: '50px' }} />
          </Link>
          <div className="navbar-links">
            <Link to="/programs" className="navbar-link">Programs</Link>
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Memberships ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/memberships/individual">Individual/Family</Link>
                <Link to="/memberships/team">Team/Group</Link>
              </div>
            </div>
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Mentality Academy ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/camps">Camps</Link>
                <Link to="/clinics">Clinics</Link>
                <Link to="/workshops">Workshops</Link>
              </div>
            </div>
            <div className="navbar-dropdown">
              <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'inherit' }}>Events ▾</button>
              <div className="navbar-dropdown-content">
                <Link to="/shoot-n-hoops">Shoot N HOOPS</Link>
                <Link to="/summer-sizzle">Summer Sizzle Circuit</Link>
                <Link to="/winter-wars">Winter Wars Circuit</Link>
                <Link to="/media-gallery">Media/Video Gallery</Link>
              </div>
            </div>
            <Link to="/facilities" className="navbar-link">Facilities</Link>
            <Link to="/about" className="navbar-link">About</Link>
            <Link to="/shop" className="navbar-link">Shop</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
        padding: '5rem 2rem 3rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '1rem',
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
            MNASE Merchandise
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#94a3b8' }}>
            Show your MNASE pride with official team gear
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            {merchandise.map((item, index) => (
              <div 
                key={index}
                data-testid={`product-${index}`}
                style={{ 
                  border: '2px solid #e8eeff',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ 
                  width: '100%', 
                  height: '300px',
                  overflow: 'hidden',
                  background: '#f1f5f9'
                }}>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>
                    {item.name}
                  </h3>
                  <p style={{ color: '#64748b', marginBottom: '1rem', lineHeight: '1.6' }}>
                    {item.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: '700', color: '#dc2626' }}>
                      {item.price}
                    </span>
                    <Button 
                      data-testid={`add-to-cart-${index}`}
                      style={{ 
                        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                        border: 'none'
                      }}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section style={{ padding: '3rem 2rem', background: 'linear-gradient(135deg, #f8f9ff 0%, #e8eeff 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b' }}>
            Online Store Coming Soon!
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '2rem' }}>
            We're currently building our online store. In the meantime, merchandise can be purchased at our facilities or during events. Contact us for availability and pickup options.
          </p>
          <Link to="/contact">
            <Button style={{ 
              padding: '1rem 2rem', 
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              border: 'none'
            }}>
              Contact for Orders
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Shop;