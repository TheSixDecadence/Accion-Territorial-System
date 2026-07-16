"use client";

import { useEffect, useState } from "react";
import { authenticatedApiFetch } from "@/app/Libs/apiFetch";
import Button from "@/app/UI/Shared/Button";
import Modal from "@/app/UI/Shared/Modal";
import PageHeader from "@/app/UI/Shared/PageHeader";
import Pagination from "@/app/UI/Shared/Pagination";
import UserForm from "./UserForm";

const roleLabels = {
  ADMIN: "Administrador",
  COORDINATOR: "Coordinador",
  STAFF: "Personal",
};

export default function Wrapper() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);

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

  const closeModal = () => setModal(null);

  const saveUser = async (values, formikHelpers) => {
    const isEditing = modal?.type === "edit";
    const payload = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      role: values.role,
      ...(!isEditing && { password: values.password }),
    };
    const response = await authenticatedApiFetch({
      url: isEditing ? `/users/${modal.user.id}/` : "/users/",
      method: isEditing ? "PATCH" : "POST",
      payload,
    });

    if (response?.error) {
      formikHelpers.setStatus(
        getApiError(response.data) ||
        response.message ||
        "No fue posible guardar el usuario.",
      );
      formikHelpers.setSubmitting(false);
      return;
    }

    setUsers((current) =>
      isEditing
        ? current.map((user) => (user.id === response.id ? response : user))
        : [...current, response],
    );
    closeModal();
  };

  return (
    <UsersPage
      error={error}
      isLoading={isLoading}
      onCreate={() => setModal({ type: "create" })}
      onEdit={(user) => setModal({ type: "edit", user })}
      users={users}
    >
      <Modal
        onClose={closeModal}
        open={Boolean(modal)}
        title={modal?.type === "edit" ? "Editar Usuario" : "Nuevo Usuario"}
      >
        <UserForm
          initialUser={modal?.type === "edit" ? modal.user : null}
          onCancel={closeModal}
          onSubmit={saveUser}
        />
      </Modal>
    </UsersPage>
  );
}

function UsersPage({ children, error, isLoading, onCreate, onEdit, users }) {
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const firstUserIndex = (currentPage - 1) * pageSize;
  const visibleUsers = users.slice(firstUserIndex, firstUserIndex + pageSize);

  return (
    <div className="flex min-h-screen w-full flex-1 flex-col bg-[var(--color-background)]">
      <PageHeader
        actionLabel="Nuevo Usuario"
        onAction={onCreate}
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
                  {visibleUsers.map((user) => (
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
                          onClick={() => onEdit(user)}
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
          {!isLoading && !error && users.length > 0 ? (
            <Pagination
              label={`Mostrando ${visibleUsers.length} de ${users.length} usuarios`}
              onNext={() => setPage((current) => current + 1)}
              onPrevious={() => setPage((current) => current - 1)}
              page={currentPage}
              totalPages={totalPages}
            />
          ) : null}
        </div>
      </section>
      {children}
    </div>
  );
}

function getApiError(data) {
  if (!data || typeof data !== "object") return "";
  const firstError = Object.values(data).flat()[0];
  return typeof firstError === "string" ? firstError : "";
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
