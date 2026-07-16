"use client";

import { useEffect, useState } from "react";
import { authenticatedApiFetch } from "@/app/Libs/apiFetch";
import Button from "@/app/UI/Shared/Button";
import PageHeader from "@/app/UI/Shared/PageHeader";

const roleLabels = {
  ADMIN: "Administrador",
  COORDINATOR: "Coordinador",
  STAFF: "Personal",
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      const response = await authenticatedApiFetch({ url: "/users/" });
      if (!active) return;

      if (response?.error) {
        setError(response.message || "No fue posible cargar los usuarios.");
      } else {
        setUsers(Array.isArray(response) ? response : response.results || []);
      }

      setIsLoading(false);
    };

    loadUsers();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-1 flex-col bg-[var(--color-background)]">
      <PageHeader
        actionDisabled
        actionLabel="Nuevo Usuario"
        title="Usuarios"
      />

      <section className="w-full flex-1 px-5 py-10 sm:px-7 lg:px-10 lg:py-14">
        <div className="w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          {isLoading ? (
            <StatusMessage>Cargando usuarios…</StatusMessage>
          ) : error ? (
            <StatusMessage tone="error">{error}</StatusMessage>
          ) : users.length === 0 ? (
            <StatusMessage>No hay usuarios registrados.</StatusMessage>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="text-[var(--color-text-muted)]">
                  <tr className="border-b border-[var(--color-border)]">
                    <HeaderCell>Nombre</HeaderCell>
                    <HeaderCell>Correo</HeaderCell>
                    <HeaderCell>Teléfono</HeaderCell>
                    <HeaderCell>Rol</HeaderCell>
                    <HeaderCell>
                      <span className="sr-only">Acciones</span>
                    </HeaderCell>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      className="border-b border-[var(--color-border)] last:border-b-0"
                      key={user.id}
                    >
                      <Cell className="font-semibold text-[var(--color-primary)]">
                        {[user.first_name, user.last_name]
                          .filter(Boolean)
                          .join(" ") || "Sin nombre"}
                      </Cell>
                      <Cell>{user.email}</Cell>
                      <Cell>{user.phone || "—"}</Cell>
                      <Cell>{roleLabels[user.role] || user.role}</Cell>
                      <Cell>
                        <Button
                          className="min-h-7 px-4 py-1 text-xs"
                          disabled
                          variant="secondary"
                        >
                          Editar
                        </Button>
                      </Cell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function HeaderCell({ children }) {
  return <th className="px-4 py-2 text-center font-normal">{children}</th>;
}

function Cell({ children, className = "" }) {
  return <td className={`px-4 py-2 text-center ${className}`}>{children}</td>;
}

function StatusMessage({ children, tone = "default" }) {
  return (
    <p
      className={`px-6 py-12 text-center text-sm ${tone === "error"
        ? "text-[var(--color-danger)]"
        : "text-[var(--color-text-muted)]"
        }`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
