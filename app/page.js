import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WhatIsAyu from "./components/WhatIsAyu";
import AyuVsAyush from "./components/AyuVsAyush";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhatIsAyu />
        <AyuVsAyush />
      </main>
    </>
  );
}
