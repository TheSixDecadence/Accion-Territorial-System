"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Form, Formik } from "formik";
import apiFetch from "@/app/Libs/apiFetch";
import { useAuth } from "@/app/store/useAuth";
import { getUserLoginValidationSchema } from "@/app/Libs/yup";

const loginControlClass =
  "mt-1 min-h-[42px] w-full rounded-md border border-white/30 bg-[#f2f2f6] px-3 text-sm text-[var(--color-text)] outline-none focus:border-white focus:ring-2 focus:ring-white/25";

function LoginPage({ error, isLoading }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-5 py-10">
      <section className="w-full max-w-[290px] rounded-xl border border-[#46499a] border-b-[3px] border-b-[var(--color-accent)] bg-[var(--color-primary)] px-5 pb-14 pt-4 text-white shadow-sm">
        <header className="mb-3">
          <h1 className="text-sm font-bold">Acción Territorial</h1>
          <p className="mt-0.5 max-w-[190px] text-xs leading-[1.2] text-white/90">
            Subsecretaría de Vinculación Ciudadana
          </p>
        </header>

        <Form className="space-y-4" noValidate>
          <Field name="email">
            {({ field, meta }) => (
              <label
                className="block text-[11px] text-white/90"
                htmlFor="login-email"
              >
                Correo Electrónico
                <input
                  {...field}
                  autoComplete="email"
                  autoFocus
                  className={loginControlClass}
                  id="login-email"
                  type="email"
                />
                {meta.touched && meta.error ? (
                  <span className="mt-1 block text-[11px] text-pink-200">
                    {meta.error}
                  </span>
                ) : null}
              </label>
            )}
          </Field>

          <Field name="password">
            {({ field, meta }) => (
              <label
                className="block text-[11px] text-white/90"
                htmlFor="login-password"
              >
                Contraseña
                <input
                  {...field}
                  autoComplete="current-password"
                  className={loginControlClass}
                  id="login-password"
                  type="password"
                />
                {meta.touched && meta.error ? (
                  <span className="mt-1 block text-[11px] text-pink-200">
                    {meta.error}
                  </span>
                ) : null}
              </label>
            )}
          </Field>

          {error ? (
            <p
              className="rounded-md bg-white/95 px-3 py-2 text-xs text-[var(--color-danger)]"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            className="mt-4 flex min-h-8 w-full items-center justify-center rounded-md bg-[var(--color-accent)] px-4 text-base font-normal text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Iniciando sesión…" : "Iniciar sesión"}
          </button>
        </Form>
      </section>
    </div>
  );
}

export default function Wrapper() {
  const router = useRouter();
  const {
    accessToken,
    setAccessToken,
    setRefreshToken,
    setSessionVerified,
  } = useAuth();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (accessToken) router.replace("/");
  }, [accessToken, router]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setError(null);

    const response = await apiFetch({
      url: "/auth/login/",
      method: "POST",
      payload: {
        email: values.email.trim(),
        password: values.password,
      },
    });

    if (response?.error) {
      setError(
        response.status === 401
          ? "Correo o contraseña incorrectos"
          : response.message || "No fue posible iniciar sesión",
      );
      setIsLoading(false);
      return;
    }

    setAccessToken(response.access);
    setRefreshToken(response.refresh);
    setSessionVerified(true);
    setIsLoading(false);
    router.replace("/");
  };

  if (accessToken) return null;

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      onSubmit={handleSubmit}
      validationSchema={getUserLoginValidationSchema()}
    >
      <LoginPage error={error} isLoading={isLoading} />
    </Formik>
  );
}
