import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Stakeholders from "./components/Stakeholders";
import Traction from "./components/Traction";
import Founder from "./components/Founder";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <HowItWorks />
        <Stakeholders />
        <Traction />
        <Founder />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
