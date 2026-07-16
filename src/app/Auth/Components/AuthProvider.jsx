"use client";

import { useEffect } from "react";
import apiFetch from "@/app/Libs/apiFetch";
import { useAuth } from "@/app/store/useAuth";
import { refreshSession } from "../authHelpers";

export default function AuthProvider({ children }) {
  const { accessToken, clearAuth, setSessionVerified, setUser } = useAuth();

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      setSessionVerified(false);

      if (!accessToken) {
        setSessionVerified(true);
        return;
      }

      let response = await apiFetch({
        url: "/users/me/",
        token: accessToken,
      });

      if (response?.error && response.status === 401) {
        if (!(await refreshSession())) {
          clearAuth();
          return;
        }

        response = await apiFetch({
          url: "/users/me/",
          token: useAuth.getState().accessToken,
        });
      }

      if (!active) return;

      if (response?.error) {
        clearAuth();
        return;
      }

      setUser(response);
      setSessionVerified(true);
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, [accessToken, clearAuth, setSessionVerified, setUser]);

  return children;
}
