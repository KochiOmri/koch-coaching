/* ============================================================
   MAIN PAGE - src/app/page.tsx
   ============================================================
   Homepage of the KOCH Functional Patterns website.
   Assembles all sections in the ideal flow:
   
   1. Navbar → always visible
   2. Hero → video background, first impression
   3. About → your story + video of you coaching
   4. Video Showcase → gallery of training clips
   5. Services → what you offer
   6. Method → 4-step process with video demos
   7. Results → transformation videos + testimonials
   8. Booking → appointment scheduler
   9. Footer → contact + links
   ============================================================ */

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import VideoShowcase from "@/components/VideoShowcase";
import Services from "@/components/Services";
import Method from "@/components/Method";
import Results from "@/components/Results";
import BookingForm from "@/components/BookingForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <VideoShowcase />
        <Services />
        <Method />
        <Results />
        <BookingForm />
      </main>
      <Footer />
    </>
  );
}
