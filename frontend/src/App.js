import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Home from '@/pages/Home';
import Programs from '@/pages/Programs';
import Memberships from '@/pages/Memberships';
import MembershipPlans from '@/pages/MembershipPlans';
import IndividualMemberships from '@/pages/IndividualMemberships';
import TeamMemberships from '@/pages/TeamMemberships';
import Camps from '@/pages/Camps';
import Clinics from '@/pages/Clinics';
import Workshops from '@/pages/Workshops';
import Events from '@/pages/Events';
import CalendarPage from '@/pages/CalendarPage';
import ShootNHoops from '@/pages/ShootNHoops';
import SummerSizzle from '@/pages/SummerSizzle';
import WinterWars from '@/pages/WinterWars';
import MediaGallery from '@/pages/MediaGallery';
import Facilities from '@/pages/Facilities';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import FAQ from '@/pages/FAQ';
import Shop from '@/pages/Shop';
import Policies from '@/pages/Policies';
import GetInvolved from '@/pages/GetInvolved';
import Recruitment from '@/pages/Recruitment';
import Sponsorship from '@/pages/Sponsorship';
import Scores from '@/pages/Scores';
import Stats from '@/pages/Stats';
import Foundation from '@/pages/Foundation';
import News from '@/pages/News';
import Gallery from '@/pages/Gallery';
import Testimonials from '@/pages/Testimonials';
import EnhancedRegistration from '@/pages/EnhancedRegistration';
import ProgramRegistration from '@/pages/ProgramRegistration';
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
          <Route path="/programs" element={<Programs />} />
          <Route path="/memberships" element={<MembershipPlans />} />
          <Route path="/memberships-old" element={<Memberships />} />
          <Route path="/memberships/individual" element={<IndividualMemberships />} />
          <Route path="/memberships/team" element={<TeamMemberships />} />
          <Route path="/camps" element={<Camps />} />
          <Route path="/clinics" element={<Clinics />} />
          <Route path="/workshops" element={<Workshops />} />
          <Route path="/events" element={<Events />} />
          <Route path="/shoot-n-hoops" element={<ShootNHoops />} />
          <Route path="/summer-sizzle" element={<SummerSizzle />} />
          <Route path="/winter-wars" element={<WinterWars />} />
          <Route path="/media-gallery" element={<MediaGallery />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/get-involved" element={<GetInvolved />} />
          <Route path="/recruitment" element={<Recruitment />} />
          <Route path="/sponsorship" element={<Sponsorship />} />
          <Route path="/scores" element={<Scores />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/foundation" element={<Foundation />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:postId" element={<News />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/register" element={<EnhancedRegistration />} />
          <Route path="/program-registration" element={<ProgramRegistration />} />
          <Route path="/dashboard" element={
            token && user ? (
              ['admin', 'super_admin'].includes(user.role) ? <AdminDashboard /> : <MemberDashboard />
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