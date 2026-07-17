import AppShell from "@/app/Layout/Layout";
import AuthProvider from "@/app/Auth/Components/AuthProvider";
import "./globals.css";

export const metadata = {
  title: "Accion Territorial",
  description: "Sistema web de gestion territorial.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-[var(--color-background)] text-[var(--color-text)]">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
