"use client";

import { useEffect } from "react";
import apiFetch from "@/app/Libs/apiFetch";
import { useAuth } from "@/app/store/useAuth";
import { logoutUser, refreshSession } from "../authHelpers";

export default function AuthProvider({ children }) {
  const { accessToken, setSessionVerified, setUser } = useAuth();

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
          logoutUser();
          return;
        }

        response = await apiFetch({
          url: "/users/me/",
          token: useAuth.getState().accessToken,
        });
      }

      if (!active) return;

      if (response?.error) {
        logoutUser();
        return;
      }

      setUser(response);
      setSessionVerified(true);
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, [accessToken, setSessionVerified, setUser]);

  return children;
}
