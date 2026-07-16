const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const DEFAULT_TIMEOUT_MS = 15000;

export default async function apiFetch({
  url = "",
  method = "GET",
  payload,
  token,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_URL}${url}`, {
      method,
      headers: {
        ...(payload && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: payload ? JSON.stringify(payload) : undefined,
      signal: controller.signal,
    });
    const data = response.status === 204 ? null : await response.json();

    if (!response.ok) {
      return {
        data,
        error: true,
        message: data?.detail || data?.message || null,
        status: response.status,
      };
    }

    return data;
  } catch (error) {
    return {
      error: true,
      message:
        error?.name === "AbortError"
          ? "La solicitud tardó demasiado."
          : "No fue posible conectar con el servidor.",
      status: null,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function authenticatedApiFetch(options) {
  const { useAuth } = await import("@/app/store/useAuth");
  const { accessToken } = useAuth.getState();
  let response = await apiFetch({ ...options, token: accessToken });

  if (!response?.error || response.status !== 401) return response;

  const { refreshSession } = await import("@/app/Auth/authHelpers");

  if (!(await refreshSession())) {
    useAuth.getState().clearAuth();
    return response;
  }

  response = await apiFetch({
    ...options,
    token: useAuth.getState().accessToken,
  });
  return response;
}
