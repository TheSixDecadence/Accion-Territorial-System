"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/store/useAuth";
import { isAuthenticated } from "../authHelpers";

export default function ProtectedRoute({ allowedRoles, children }) {
  const router = useRouter();
  const isSessionVerified = useAuth((state) => state.isSessionVerified);
  const user = useAuth((state) => state.user);
  const isAllowed = !allowedRoles || allowedRoles.includes(user?.role);

  useEffect(() => {
    if (!isSessionVerified) return;

    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    if (!isAllowed) router.replace("/rutas");
  }, [isAllowed, isSessionVerified, router]);

  if (!isSessionVerified || !isAuthenticated() || !isAllowed) return null;
  return children;
}
