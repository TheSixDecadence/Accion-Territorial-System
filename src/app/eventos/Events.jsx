"use client";

import { useEffect, useState } from "react";
import { authenticatedApiFetch } from "@/app/Libs/apiFetch";
import Modal from "@/app/UI/Shared/Modal";
import Notification from "@/app/UI/Shared/Notification";
import PageHeader from "@/app/UI/Shared/PageHeader";
import EventForm from "./EventForm";

const EVENT_STATUS = {
  SCHEDULED: "Programado",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

function EventsPage({ error, events, isLoading, onCreate }) {
  return (
    <div className="flex min-h-screen w-full flex-1 flex-col bg-[var(--color-background)]">
      <PageHeader
        actionLabel="Nuevo Evento"
        onAction={onCreate}
        title="Eventos"
      />

      <section className="w-full flex-1 px-5 py-8 sm:px-7 lg:px-10">
        {isLoading ? (
          <StatusMessage>Cargando eventos…</StatusMessage>
        ) : error ? (
          <StatusMessage tone="error">{error}</StatusMessage>
        ) : events.length === 0 ? (
          <StatusMessage>No hay eventos registrados.</StatusMessage>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EventCard({ event }) {
  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="font-medium text-[var(--color-primary)]">
          {EVENT_STATUS[event.status] || event.status}
        </span>
        <span className="text-[var(--color-text-muted)]">
          {event.location_name}
        </span>
      </div>

      <h2 className="mt-4 text-lg font-bold">{event.title}</h2>
      {event.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-muted)]">
          {event.description}
        </p>
      ) : null}

      <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="font-medium">Creado por</dt>
        <dd>{userName(event.created_by)}</dd>
        <dt className="font-medium">Fecha</dt>
        <dd>{formatDate(event.event_date)}</dd>
        <dt className="font-medium">Horario</dt>
        <dd>{formatSchedule(event.start_time, event.end_time)}</dd>
        <dt className="font-medium">Dirección</dt>
        <dd>{event.address || "—"}</dd>
      </dl>
    </article>
  );
}

function StatusMessage({ children, tone = "default" }) {
  return (
    <p
      className={`rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-14 text-center text-sm ${
        tone === "error"
          ? "text-[var(--color-danger)]"
          : "text-[var(--color-text-muted)]"
      }`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}

function userName(user) {
  if (!user) return "—";
  return (
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.email ||
    "—"
  );
}

function formatDate(date) {
  if (!date) return "—";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function formatSchedule(startTime, endTime) {
  if (!startTime) return "—";
  const start = startTime.slice(0, 5);
  return endTime ? `${start} - ${endTime.slice(0, 5)}` : start;
}

function getApiError(data) {
  if (!data || typeof data !== "object") return "";
  const firstError = Object.values(data).flat()[0];
  return typeof firstError === "string" ? firstError : "";
}

export default function Wrapper() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    let active = true;

    const loadEvents = async () => {
      const response = await authenticatedApiFetch({
        url: "/community/events/",
      });
      if (!active) return;

      if (response?.error) {
        setError(response.message || "No fue posible cargar los eventos.");
      } else {
        setEvents(
          Array.isArray(response) ? response : response.results || [],
        );
      }

      setIsLoading(false);
    };

    loadEvents();
    return () => {
      active = false;
    };
  }, []);

  const createEvent = async (values, formikHelpers) => {
    const response = await authenticatedApiFetch({
      url: "/community/events/",
      method: "POST",
      payload: {
        title: values.title.trim(),
        description: values.description.trim(),
        event_date: values.event_date,
        start_time: values.start_time,
        end_time: values.end_time || null,
        location_name: values.location_name.trim(),
        address: values.address.trim(),
        status: values.status,
      },
    });

    if (response?.error) {
      formikHelpers.setStatus(
        getApiError(response.data) ||
          response.message ||
          "No fue posible guardar el evento.",
      );
      formikHelpers.setSubmitting(false);
      return;
    }

    setEvents((current) => [response, ...current]);
    setShowForm(false);
    setNotification("Evento creado correctamente");
  };

  return (
    <>
      <EventsPage
        error={error}
        events={events}
        isLoading={isLoading}
        onCreate={() => setShowForm(true)}
      />
      <Modal
        onClose={() => setShowForm(false)}
        open={showForm}
        title="Nuevo Evento"
      >
        <EventForm
          onCancel={() => setShowForm(false)}
          onSubmit={createEvent}
        />
      </Modal>
      <Notification
        message={notification}
        onClose={() => setNotification("")}
      />
    </>
  );
}
