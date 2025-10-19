import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const MobileNav = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2 text-gray-700 hover:text-gray-900"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold">Menu</h2>
            <button onClick={closeMenu} className="p-1">
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <Link
              to="/programs"
              className="block px-4 py-3 hover:bg-gray-100"
              onClick={closeMenu}
            >
              Programs
            </Link>

            <div className="px-4 py-3">
              <details className="group">
                <summary className="cursor-pointer font-medium">
                  Memberships
                </summary>
                <div className="pl-4 mt-2 space-y-2">
                  <Link
                    to="/memberships"
                    className="block py-2 text-sm hover:text-blue-600"
                    onClick={closeMenu}
                  >
                    Overview
                  </Link>
                  <Link
                    to="/individual-memberships"
                    className="block py-2 text-sm hover:text-blue-600"
                    onClick={closeMenu}
                  >
                    Individual
                  </Link>
                  <Link
                    to="/team-memberships"
                    className="block py-2 text-sm hover:text-blue-600"
                    onClick={closeMenu}
                  >
                    Team
                  </Link>
                </div>
              </details>
            </div>

            <div className="px-4 py-3">
              <details className="group">
                <summary className="cursor-pointer font-medium">
                  Mentality Academy
                </summary>
                <div className="pl-4 mt-2 space-y-2">
                  <Link
                    to="/camps"
                    className="block py-2 text-sm hover:text-blue-600"
                    onClick={closeMenu}
                  >
                    Camps
                  </Link>
                  <Link
                    to="/clinics"
                    className="block py-2 text-sm hover:text-blue-600"
                    onClick={closeMenu}
                  >
                    Clinics
                  </Link>
                  <Link
                    to="/workshops"
                    className="block py-2 text-sm hover:text-blue-600"
                    onClick={closeMenu}
                  >
                    Workshops
                  </Link>
                </div>
              </details>
            </div>

            <div className="px-4 py-3">
              <details className="group">
                <summary className="cursor-pointer font-medium">
                  Events
                </summary>
                <div className="pl-4 mt-2 space-y-2">
                  <Link
                    to="/events"
                    className="block py-2 text-sm hover:text-blue-600"
                    onClick={closeMenu}
                  >
                    Calendar
                  </Link>
                  <Link
                    to="/shoot-n-hoops"
                    className="block py-2 text-sm hover:text-blue-600"
                    onClick={closeMenu}
                  >
                    Shoot N Hoops
                  </Link>
                  <Link
                    to="/summer-sizzle"
                    className="block py-2 text-sm hover:text-blue-600"
                    onClick={closeMenu}
                  >
                    Summer Sizzle
                  </Link>
                  <Link
                    to="/winter-wars"
                    className="block py-2 text-sm hover:text-blue-600"
                    onClick={closeMenu}
                  >
                    Winter Wars
                  </Link>
                </div>
              </details>
            </div>

            <Link
              to="/facilities"
              className="block px-4 py-3 hover:bg-gray-100"
              onClick={closeMenu}
            >
              Facilities
            </Link>

            <Link
              to="/news"
              className="block px-4 py-3 hover:bg-gray-100"
              onClick={closeMenu}
            >
              News
            </Link>

            <Link
              to="/about"
              className="block px-4 py-3 hover:bg-gray-100"
              onClick={closeMenu}
            >
              About
            </Link>

            <Link
              to="/faq"
              className="block px-4 py-3 hover:bg-gray-100"
              onClick={closeMenu}
            >
              FAQ
            </Link>

            <Link
              to="/shop"
              className="block px-4 py-3 hover:bg-gray-100"
              onClick={closeMenu}
            >
              Shop
            </Link>

            {user && (
              <>
                <div className="border-t my-2"></div>
                <Link
                  to="/dashboard"
                  className="block px-4 py-3 hover:bg-gray-100 font-medium"
                  onClick={closeMenu}
                >
                  {user.role === 'admin' || user.role === 'super_admin'
                    ? 'Admin Dashboard'
                    : 'My Dashboard'}
                </Link>
              </>
            )}
          </nav>

          {/* Footer Actions */}
          <div className="border-t p-4">
            {user ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Signed in as <strong>{user.name}</strong>
                </p>
                <button
                  onClick={() => {
                    closeMenu();
                    onLogout();
                  }}
                  className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  closeMenu();
                  // Trigger login modal (you'll need to pass this from parent)
                  const loginBtn = document.querySelector('[data-login-trigger]');
                  if (loginBtn) loginBtn.click();
                }}
                className="block w-full bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
