import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/app/Layout/Navbar/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Accion Territorial",
  description: "Sistema web de gestion territorial.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F7F8F7] text-slate-950">
        <main className="flex min-h-screen bg-[#F7F8F7]">
          <Navbar />
          <section className="flex flex-1 flex-col px-10 py-8">
            {children}
          </section>
        </main>
      </body>
    </html>
  );
}
