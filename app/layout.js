import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";

export const viewport = {
  themeColor: "#128C7E",
};

export const metadata = {
  title: "AYU — Healthcare on WhatsApp",
  description:
    "Ayu is a WhatsApp-based healthcare platform. Patients book OPD tokens, get lab reports, and manage medicine reminders. Doctors, clinics, and pharmacies coordinate faster. 300+ users, 67 healthcare partners.",
  keywords:
    "AYU, healthcare, WhatsApp, OPD booking, lab reports, medicine reminders, clinic coordination, pharmacy, India",
  authors: [{ name: "Shaik Mohammad Ajhaj" }],
  openGraph: {
    title: "AYU — Healthcare on WhatsApp",
    description:
      "Ayu connects doctors, patients, and pharmacies through WhatsApp. No new app needed.",
    type: "website",
    url: "https://ayuhealth.in",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%23128C7E'/><path d='M30 50h40M50 30v40' stroke='%23ffffff' stroke-width='10' stroke-linecap='round'/></svg>"
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
