/* ============================================================
   MAIN PAGE - src/app/page.tsx
   ============================================================
   This is the homepage of the KOCH Functional Patterns website.
   
   It assembles all the components in order:
   1. Navbar (fixed at top, always visible)
   2. Hero (full-screen landing section)
   3. About (who you are, your story)
   4. Services (what you offer, pricing)
   5. Method (how Functional Patterns works)
   6. Results (testimonials, before/after)
   7. BookingForm (appointment scheduling)
   8. Footer (contact info, links)
   
   Each component is in its own file for clean organization.
   The page scrolls vertically through all sections.
   ============================================================ */

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Method from "@/components/Method";
import Results from "@/components/Results";
import BookingForm from "@/components/BookingForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* Navigation bar - stays fixed at the top while scrolling */}
      <Navbar />

      {/* Main content - each section has its own id for anchor linking */}
      <main>
        {/* Hero: The first impression. Full-screen with video background. */}
        <Hero />

        {/* About: Your story and credentials. Builds trust. */}
        <About />

        {/* Services: What you offer. Drives interest. */}
        <Services />

        {/* Method: How FP works. Educates the visitor. */}
        <Method />

        {/* Results: Social proof. Builds confidence to book. */}
        <Results />

        {/* Booking: The conversion point. Where visitors become clients. */}
        <BookingForm />
      </main>

      {/* Footer: Contact info, links, and social media. */}
      <Footer />
    </>
  );
}
