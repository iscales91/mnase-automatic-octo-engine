import React, { useState } from 'react';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

function DashboardSidebar({ items, activeItem, onItemChange, className = '' }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleItemClick = (itemValue) => {
    onItemChange(itemValue);
    // Close mobile menu after selection
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="dashboard-mobile-menu-btn"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`dashboard-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''} ${className}`}
        style={{
          width: isCollapsed ? '70px' : '250px',
          minWidth: isCollapsed ? '70px' : '250px',
          maxWidth: isCollapsed ? '70px' : '250px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          color: 'white',
          transition: 'width 0.3s ease, min-width 0.3s ease, max-width 0.3s ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          flexShrink: 0
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '70px'
          }}
        >
          {!isCollapsed && (
            <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              Dashboard
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="sidebar-toggle-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => handleItemClick(item.value)}
              data-testid={item.testId || `sidebar-${item.value}`}
              style={{
                width: '100%',
                padding: isCollapsed ? '1rem 0' : '1rem 1.5rem',
                background: activeItem === item.value ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                border: 'none',
                borderLeft: activeItem === item.value ? '4px solid #3b82f6' : '4px solid transparent',
                color: activeItem === item.value ? '#60a5fa' : '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.95rem',
                fontWeight: activeItem === item.value ? '600' : '500',
                textAlign: 'left',
                justifyContent: isCollapsed ? 'center' : 'flex-start'
              }}
              onMouseEnter={(e) => {
                if (activeItem !== item.value) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (activeItem !== item.value) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#cbd5e1';
                }
              }}
            >
              {item.icon && (
                <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.25rem' }}>
                  {item.icon}
                </span>
              )}
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.75rem',
              color: '#94a3b8'
            }}
          >
            MNASE Basketball
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="dashboard-sidebar-overlay"
          onClick={toggleMobileMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99
          }}
        />
      )}

      <style jsx>{`
        .dashboard-mobile-menu-btn {
          display: none;
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 101;
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          border: none;
          border-radius: 8px;
          padding: 0.75rem;
          color: white;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        @media (max-width: 768px) {
          .dashboard-mobile-menu-btn {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .dashboard-sidebar {
            position: fixed !important;
            top: 0;
            left: 0;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            width: 250px !important;
            min-width: 250px !important;
          }

          .dashboard-sidebar.mobile-open {
            transform: translateX(0);
          }

          .sidebar-toggle-btn {
            display: none !important;
          }
        }

        .dashboard-sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .dashboard-sidebar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .dashboard-sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .dashboard-sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  );
}

export default DashboardSidebar;
