"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/app/Layout/Navbar/Navbar";
import ProtectedRoute from "@/app/Auth/Components/ProtectedRoute";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const allowedRoles = pathname.startsWith("/usuarios") ? ["ADMIN"] : undefined;

  if (pathname === "/login") {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <main className="flex min-h-screen bg-[var(--color-background)]">
        <Navbar />
        <section className="flex min-w-0 flex-1 flex-col px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </section>
      </main>
    </ProtectedRoute>
  );
}
