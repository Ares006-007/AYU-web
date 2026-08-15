import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WhatIsAyu from "./components/WhatIsAyu";
import AyuVsAyush from "./components/AyuVsAyush";
import ForDoctors from "./components/ForDoctors";
import ForPatients from "./components/ForPatients";
import ForPharmacies from "./components/ForPharmacies";
import BiggerPicture from "./components/BiggerPicture";
import Traction from "./components/Traction";
import Founder from "./components/Founder";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhatIsAyu />
        <AyuVsAyush />
        <ForDoctors />
        <ForPatients />
        <ForPharmacies />
        <BiggerPicture />
        <Traction />
        <Founder />
      </main>
      <Footer />
    </>
  );
}
