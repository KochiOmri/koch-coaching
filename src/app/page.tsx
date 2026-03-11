import { getVideoConfig } from "@/lib/video-config";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import VideoShowcase from "@/components/VideoShowcase";
import Services from "@/components/Services";
import Method from "@/components/Method";
import Results from "@/components/Results";
import BookingForm from "@/components/BookingForm";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function Home() {
  const config = getVideoConfig();

  return (
    <>
      <Navbar />
      <main>
        <Hero videoSrc={config.hero} />
        <About videoSrc={config.about} />
        <VideoShowcase videos={config.showcase} />
        <Services />
        <Method videos={config.method} />
        <Results videos={config.results} />
        <BookingForm />
      </main>
      <Footer />
    </>
  );
}
