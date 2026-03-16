/**
 * Homepage — Server Component
 *
 * Assembles all sections of the main website. Fetches video config and CMS content
 * server-side (getVideoConfig, getSiteContent) and passes them as props to each
 * component. No client-side data fetching — everything is resolved before render.
 *
 * Sections: Navbar, Hero, About, VideoShowcase, Services, Method, BeforeAfterSlider,
 * Results, InstagramFeed, BookingForm, Footer, WhatsAppButton.
 */
import { getVideoConfig } from "@/lib/video-config";
import { getSiteContent } from "@/lib/site-content";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import VideoShowcase from "@/components/VideoShowcase";
import FPMethodology from "@/components/FPMethodology";
import Services from "@/components/Services";
import Method from "@/components/Method";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import Results from "@/components/Results";
import InstagramFeed from "@/components/InstagramFeed";
import BookingForm from "@/components/BookingForm";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export const dynamic = "force-dynamic";

export default function Home() {
  const config = getVideoConfig();
  const content = getSiteContent();

  return (
    <>
      <Navbar />
      <main>
        <Hero videoSrc={config.hero} content={content.hero} />
        <About videoSrc={config.about} content={content.about} />
        <VideoShowcase videos={config.showcase} />
        <FPMethodology content={content.fpContent} />
        <Services content={content.services} />
        <Method videos={config.method} content={content.method} />
        <BeforeAfterSlider />
        <Results videos={config.results} testimonials={content.testimonials} />
        <InstagramFeed handle={content.contact.instagramHandle} />
        <BookingForm />
      </main>
      <Footer content={content.contact} />
      <WhatsAppButton
        phone={content.contact.whatsappNumber}
        message={content.contact.whatsappMessage}
      />
      <PWAInstallPrompt />
    </>
  );
}
