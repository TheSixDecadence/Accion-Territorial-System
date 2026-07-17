import apiFetch from "@/app/Libs/apiFetch";
import { useAuth } from "@/app/store/useAuth";

export const isAuthenticated = () => Boolean(useAuth.getState().accessToken);

export const refreshSession = async () => {
  const { refreshToken, setAccessToken, setRefreshToken } = useAuth.getState();
  if (!refreshToken) return false;

  const response = await apiFetch({
    url: "/auth/refresh/",
    method: "POST",
    payload: { refresh: refreshToken },
  });

  if (response?.error) return false;

  setAccessToken(response.access);
  if (response.refresh) setRefreshToken(response.refresh);
  return true;
};
