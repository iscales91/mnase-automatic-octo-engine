import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Home from '@/pages/Home';
import Programs from '@/pages/Programs';
import Memberships from '@/pages/Memberships';
import Events from '@/pages/Events';
import Facilities from '@/pages/Facilities';
import MemberDashboard from '@/pages/MemberDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import RegistrationSuccess from '@/pages/RegistrationSuccess';
import BookingSuccess from '@/pages/BookingSuccess';
import '@/App.css';

function App() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/dashboard" element={
            token && user ? (
              user.role === 'admin' ? <AdminDashboard /> : <MemberDashboard />
            ) : <Navigate to="/" />
          } />
          <Route path="/registration-success" element={<RegistrationSuccess />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;