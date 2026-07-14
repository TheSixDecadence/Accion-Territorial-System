import Navbar from "@/app/Layout/Navbar/Navbar";
import "./globals.css";

export const metadata = {
  title: "Accion Territorial",
  description: "Sistema web de gestion territorial.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-[var(--color-background)] text-[var(--color-text)]">
        <main className="flex min-h-screen bg-[var(--color-background)]">
          <Navbar />
          <section className="flex min-w-0 flex-1 flex-col px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
            {children}
          </section>
        </main>
      </body>
    </html>
  );
}
