"use client";

import { useCallback, useEffect, useState } from "react";
import { authenticatedApiFetch } from "@/app/Libs/apiFetch";
import { useAuth } from "@/app/store/useAuth";
import Button from "@/app/UI/Shared/Button";
import Modal from "@/app/UI/Shared/Modal";
import Notification from "@/app/UI/Shared/Notification";
import PageHeader from "@/app/UI/Shared/PageHeader";
import Pagination from "@/app/UI/Shared/Pagination";
import ArticleForm from "./ArticleForm";

const pageSize = 10;

function ArticlesPage({
  articles,
  children,
  error,
  isAdmin,
  isLoading,
  onCreate,
  onEdit,
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(articles.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const firstArticleIndex = (currentPage - 1) * pageSize;
  const visibleArticles = articles.slice(
    firstArticleIndex,
    firstArticleIndex + pageSize,
  );

  return (
    <div className="flex min-h-screen w-full flex-1 flex-col bg-[var(--color-background)]">
      <PageHeader
        actionLabel={isAdmin ? "Nuevo Artículo" : undefined}
        onAction={onCreate}
        title="Artículos"
      />

      <section className="w-full flex-1 px-5 py-10 sm:px-7 lg:px-10 lg:py-14">
        <div className="w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          {isLoading ? (
            <StatusMessage>Cargando artículos…</StatusMessage>
          ) : error ? (
            <StatusMessage tone="error">{error}</StatusMessage>
          ) : articles.length === 0 ? (
            <StatusMessage>No hay artículos registrados.</StatusMessage>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead className="text-[var(--color-text-muted)]">
                  <tr className="border-b border-[var(--color-border)]">
                    <HeaderCell>Nombre</HeaderCell>
                    <HeaderCell>Descripción</HeaderCell>
                    {isAdmin ? (
                      <HeaderCell>
                        <span className="sr-only">Acciones</span>
                      </HeaderCell>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {visibleArticles.map((article) => (
                    <tr
                      className="border-b border-[var(--color-border)] last:border-b-0"
                      key={article.id}
                    >
                      <Cell className="font-semibold text-[var(--color-primary)]">
                        {article.name}
                      </Cell>
                      <Cell>{article.description || "—"}</Cell>
                      {isAdmin ? (
                        <Cell>
                          <Button
                            className="min-h-7 px-4 py-1 text-xs"
                            onClick={() => onEdit(article)}
                            variant="secondary"
                          >
                            Editar
                          </Button>
                        </Cell>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !error && articles.length > 0 ? (
            <Pagination
              label={`Mostrando ${visibleArticles.length} de ${articles.length} artículos`}
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

export default function Wrapper() {
  const role = useAuth((state) => state.user?.role);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    let active = true;

    const loadArticles = async () => {
      const response = await authenticatedApiFetch({
        url: "/delivery/items/",
      });
      if (!active) return;

      if (response?.error) {
        setError(response.message || "No fue posible cargar los artículos.");
      } else {
        setArticles(
          Array.isArray(response) ? response : response.results || [],
        );
      }

      setIsLoading(false);
    };

    loadArticles();
    return () => {
      active = false;
    };
  }, []);

  const closeNotification = useCallback(() => setNotification(""), []);
  const closeModal = () => setModal(null);

  const saveArticle = async (values, formikHelpers) => {
    const isEditing = modal?.type === "edit";
    const response = await authenticatedApiFetch({
      url: isEditing
        ? `/delivery/items/${modal.article.id}/`
        : "/delivery/items/",
      method: isEditing ? "PATCH" : "POST",
      payload: {
        name: values.name.trim(),
        description: values.description.trim(),
      },
    });

    if (response?.error) {
      formikHelpers.setStatus(
        getApiError(response.data) ||
          response.message ||
          "No fue posible guardar el artículo.",
      );
      formikHelpers.setSubmitting(false);
      return;
    }

    setArticles((current) =>
      isEditing
        ? current.map((article) =>
            article.id === response.id ? response : article,
          )
        : [...current, response],
    );
    closeModal();
    setNotification(
      isEditing
        ? "Artículo actualizado correctamente"
        : "Artículo creado correctamente",
    );
  };

  return (
    <ArticlesPage
      articles={articles}
      error={error}
      isAdmin={role === "ADMIN"}
      isLoading={isLoading}
      onCreate={() => setModal({ type: "create" })}
      onEdit={(article) => setModal({ type: "edit", article })}
    >
      <Modal
        onClose={closeModal}
        open={Boolean(modal)}
        title={modal?.type === "edit" ? "Editar Artículo" : "Nuevo Artículo"}
      >
        <ArticleForm
          initialArticle={
            modal?.type === "edit" ? modal.article : null
          }
          onCancel={closeModal}
          onSubmit={saveArticle}
        />
      </Modal>
      <Notification
        message={notification}
        onClose={closeNotification}
      />
    </ArticlesPage>
  );
}
