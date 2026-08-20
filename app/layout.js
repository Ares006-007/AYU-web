import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import ScrollReveal from "./components/ScrollReveal";

export const viewport = {
  themeColor: "#0d9488",
};

export const metadata = {
  title: "AYU — Healthcare on WhatsApp | Built by Shaik Mohammad Ajhaj",
  description:
    "Ayu connects doctors, patients, and pharmacies through WhatsApp. No new apps, no behavior change. 300+ patients, 67 healthcare partners across India.",
  keywords:
    "AYU, healthcare, WhatsApp, OPD booking, lab reports, clinic coordination, pharmacy, India, healthtech startup",
  authors: [{ name: "Shaik Mohammad Ajhaj" }],
  openGraph: {
    title: "AYU — Healthcare on WhatsApp",
    description:
      "The operating system for India's neighborhood clinics. Built entirely on WhatsApp.",
    type: "website",
    url: "https://ayuhealth.in",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%230d9488'/><text x='50' y='68' font-family='system-ui' font-size='48' font-weight='700' fill='white' text-anchor='middle'>A</text></svg>"
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <ScrollReveal />
        </ThemeProvider>
      </body>
    </html>
  );
}
