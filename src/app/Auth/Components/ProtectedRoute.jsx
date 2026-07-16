"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/store/useAuth";
import { isAuthenticated } from "../authHelpers";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const isSessionVerified = useAuth((state) => state.isSessionVerified);

  useEffect(() => {
    if (isSessionVerified && !isAuthenticated()) router.replace("/login");
  }, [isSessionVerified, router]);

  if (!isSessionVerified || !isAuthenticated()) return null;
  return children;
}
