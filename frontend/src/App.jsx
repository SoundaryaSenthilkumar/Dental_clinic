import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import AboutSection from './components/AboutSection.jsx';
import WhyChooseSection from './components/WhyChooseSection.jsx';
import TreatmentsSection from './components/TreatmentsSection.jsx';
import DoctorsSection from './components/DoctorsSection.jsx';
import GallerySection from './components/GallerySection.jsx';
import TestimonialsSection from './components/TestimonialsSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import Footer from './components/Footer.jsx';
import AppointmentForm from './components/AppointmentForm.jsx';
import { BookingProvider, useBooking } from './hooks/BookingContext.jsx';

function Site() {
  const { open, doctorId, openBooking, closeBooking } = useBooking();

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar onBook={() => openBooking()} />
      <main id="main">
        <HeroSection onBook={() => openBooking()} />
        <AboutSection />
        <WhyChooseSection />
        <TreatmentsSection />
        <DoctorsSection />
        <GallerySection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      {open && <AppointmentForm key={doctorId || 'any'} initialDoctorId={doctorId} onClose={closeBooking} />}
    </>
  );
}

export default function App() {
  return (
    <BookingProvider>
      <Site />
    </BookingProvider>
  );
}
