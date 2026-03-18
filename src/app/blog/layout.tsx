import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSiteContent } from "@/lib/site-content";

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSiteContent();

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer content={content.contact} />
    </>
  );
}
