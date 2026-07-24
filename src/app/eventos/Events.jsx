"use client";

import { useEffect, useState } from "react";
import { authenticatedApiFetch } from "@/app/Libs/apiFetch";
import { useAuth } from "@/app/store/useAuth";
import Button from "@/app/UI/Shared/Button";
import Modal from "@/app/UI/Shared/Modal";
import Notification from "@/app/UI/Shared/Notification";
import PageHeader from "@/app/UI/Shared/PageHeader";
import Pagination from "@/app/UI/Shared/Pagination";
import { Map, MapControls, MapMarker } from "@/components/ui/map";
import EventForm from "./EventForm";

const EVENT_STATUS = {
  SCHEDULED: "Programado",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};
const EVENTS_PER_PAGE = 9;

function EventsPage({
  drawerEvent,
  error,
  events,
  isLoading,
  onCancel,
  onCloseDrawer,
  onCreate,
  onEdit,
  onNextPage,
  onPreviousPage,
  page,
  totalEvents,
  totalPages,
  onView,
}) {
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
          <div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <EventCard event={event} key={event.id} onView={onView} />
              ))}
            </div>
            <Pagination
              label={`Mostrando ${(page - 1) * EVENTS_PER_PAGE + 1} a ${Math.min(page * EVENTS_PER_PAGE, totalEvents)} de ${totalEvents} eventos`}
              onNext={onNextPage}
              onPrevious={onPreviousPage}
              page={page}
              totalPages={totalPages}
            />
          </div>
        )}
      </section>

      <EventDetailsDrawer
        event={drawerEvent}
        onCancel={onCancel}
        onClose={onCloseDrawer}
        onEdit={onEdit}
      />
    </div>
  );
}

function EventCard({ event, onView }) {
  return (
    <button
      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-left transition hover:border-[var(--color-primary)]"
      onClick={() => onView(event)}
      type="button"
    >
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
    </button>
  );
}

function EventDetailsDrawer({ event, onCancel, onClose, onEdit }) {
  const hasCoordinates =
    event &&
    Number.isFinite(Number(event.latitude)) &&
    Number.isFinite(Number(event.longitude));

  return (
    <div
      aria-hidden={!event}
      className={`fixed inset-0 z-50 bg-slate-950/55 transition-opacity ${
        event ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onMouseDown={onClose}
    >
      <aside
        aria-label="Detalles del evento"
        className={`ml-auto flex h-full w-full max-w-xl flex-col bg-[var(--color-surface)] shadow-2xl transition-transform duration-300 ${
          event ? "translate-x-0" : "translate-x-full"
        }`}
        onMouseDown={(currentEvent) => currentEvent.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="text-lg font-bold">Detalles del evento</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              {event?.title}
            </p>
          </div>
          <Button onClick={onClose} variant="secondary">
            Cerrar
          </Button>
        </div>

        {event ? (
          <div className="flex-1 overflow-y-auto p-5">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
        <dt className="font-semibold">Nombre</dt>
        <dd>{event.title}</dd>
        <dt className="font-semibold">Descripción</dt>
        <dd>{event.description || "—"}</dd>
        <dt className="font-semibold">Creado por</dt>
        <dd>{userName(event.created_by)}</dd>
        <dt className="font-semibold">Fecha</dt>
        <dd>{formatDate(event.event_date)}</dd>
        <dt className="font-semibold">Horario</dt>
        <dd>{formatSchedule(event.start_time, event.end_time)}</dd>
        <dt className="font-semibold">Lugar</dt>
        <dd>{event.location_name}</dd>
        <dt className="font-semibold">Dirección</dt>
        <dd>{event.address}</dd>
        <dt className="font-semibold">Estado</dt>
        <dd>{EVENT_STATUS[event.status] || event.status}</dd>
            </dl>

            <section className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">Personal ({event.staff?.length || 0})</h3>
              </div>
              {event.staff?.length ? (
                <ul className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]">
                  {event.staff.map((assignment) => (
                    <li className="flex items-center justify-between gap-3 px-3 py-3 text-sm" key={assignment.id}>
                      <div>
                        <p className="font-medium">{userName(assignment.user_detail || assignment.user)}</p>
                        <p className="text-[var(--color-text-muted)]">{assignment.assigned_role}</p>
                        {assignment.notes ? <p className="mt-1 text-xs text-[var(--color-text-muted)]">{assignment.notes}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-lg border border-[var(--color-border)] px-3 py-4 text-sm text-[var(--color-text-muted)]">No hay personal asignado.</p>
              )}
            </section>

            <section className="mt-6">
              <h3 className="mb-2 text-sm font-semibold">Ubicación</h3>
              {hasCoordinates ? (
                <div className="h-60 overflow-hidden rounded-lg border border-[var(--color-border)]">
                  <Map
                    center={[Number(event.longitude), Number(event.latitude)]}
                    theme="light"
                    zoom={15}
                  >
                    <MapMarker
                      latitude={Number(event.latitude)}
                      longitude={Number(event.longitude)}
                    />
                    <MapControls position="top-right" />
                  </Map>
                </div>
              ) : (
                <p className="rounded-lg border border-[var(--color-border)] px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  Este evento no tiene una ubicación confirmada.
                </p>
              )}
            </section>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
        {event.status !== "CANCELLED" ? (
          <>
            <Button onClick={onCancel} variant="danger">
              Cancelar Evento
            </Button>
            <Button onClick={onEdit}>
              Editar Evento
            </Button>
          </>
        ) : null}
        <Button onClick={onClose} variant="secondary">
          Cerrar
        </Button>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function EventCancellation({ event, isSubmitting, onCancel, onConfirm }) {
  return (
    <div>
      <p className="text-sm text-[var(--color-text-muted)]">
        El evento <strong>{event.title}</strong> cambiará al estado cancelado.
        Sus datos permanecerán guardados.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <Button disabled={isSubmitting} onClick={onCancel} variant="secondary">
          Volver
        </Button>
        <Button disabled={isSubmitting} onClick={onConfirm} variant="danger">
          {isSubmitting ? "Cancelando…" : "Confirmar Cancelación"}
        </Button>
      </div>
    </div>
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
  const user = useAuth((state) => state.user);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [drawerEvent, setDrawerEvent] = useState(null);
  const [notification, setNotification] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [page, setPage] = useState(1);
  const isAdmin = user?.role === "ADMIN";
  const totalPages = Math.max(1, Math.ceil(events.length / EVENTS_PER_PAGE));
  const visibleEvents = events.slice(
    (page - 1) * EVENTS_PER_PAGE,
    page * EVENTS_PER_PAGE,
  );

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
        setEvents(Array.isArray(response) ? response : response.results || []);
        setPage(1);
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
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
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

    const staffError = isAdmin
      ? await syncEventStaff(response.id, values.staff, [])
      : "";
    const completeEvent = await fetchEvent(response.id);
    setEvents((current) => [completeEvent || response, ...current]);
    setPage(1);
    setModal(null);
    setNotification(
      staffError
        ? `Evento creado, pero ${staffError}`
        : "Evento creado correctamente",
    );
  };

  const updateEvent = async (values, formikHelpers) => {
    const event = modal.event;
    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      event_date: values.event_date,
      start_time: values.start_time,
      end_time: values.end_time || null,
      location_name: values.location_name.trim(),
      address: values.address.trim(),
      status: values.status,
    };

    if (values.address_confirmation_token) {
      payload.latitude = Number(values.latitude);
      payload.longitude = Number(values.longitude);
    }

    const response = await authenticatedApiFetch({
      url: `/community/events/${event.id}/`,
      method: "PATCH",
      payload,
    });

    if (response?.error) {
      formikHelpers.setStatus(
        getApiError(response.data) ||
          response.message ||
          "No fue posible actualizar el evento.",
      );
      formikHelpers.setSubmitting(false);
      return;
    }

    const staffError = isAdmin
      ? await syncEventStaff(response.id, values.staff, event.staff || [])
      : "";
    const completeEvent = await fetchEvent(response.id);
    setEvents((current) =>
      current.map((currentEvent) =>
        currentEvent.id === response.id ? completeEvent || response : currentEvent,
      ),
    );
    setModal(null);
    setNotification(
      staffError
        ? `Evento actualizado, pero ${staffError}`
        : "Evento actualizado correctamente",
    );
  };

  const cancelEvent = async () => {
    const event = modal.event;
    setIsCancelling(true);

    const response = await authenticatedApiFetch({
      url: `/community/events/${event.id}/`,
      method: "DELETE",
    });

    setIsCancelling(false);

    if (response?.error) {
      setNotification(response.message || "No fue posible cancelar el evento.");
      return;
    }

    setEvents((current) =>
      current.map((currentEvent) =>
        currentEvent.id === event.id
          ? { ...currentEvent, status: "CANCELLED" }
          : currentEvent,
      ),
    );
    setModal(null);
    setDrawerEvent(null);
    setNotification("Evento cancelado correctamente");
  };

  const loadUsers = async () => {
    if (!isAdmin || users.length || isLoadingUsers) return;
    setIsLoadingUsers(true);
    const response = await authenticatedApiFetch({ url: "/users/" });
    setIsLoadingUsers(false);

    if (response?.error) {
      setNotification(response.message || "No fue posible cargar los usuarios.");
      return;
    }

    setUsers((Array.isArray(response) ? response : response.results || []).filter((currentUser) => currentUser.is_active));
  };

  const fetchEvent = async (eventId) => {
    const response = await authenticatedApiFetch({ url: `/community/events/${eventId}/` });
    return response?.error ? null : response;
  };

  const syncEventStaff = async (eventId, staff, originalStaff) => {
    if (!isAdmin) return "no se pudo actualizar el personal por permisos";

    const originalById = new globalThis.Map(
      originalStaff.map((assignment) => [assignment.id, assignment]),
    );
    const currentIds = new Set(staff.filter((assignment) => assignment.id).map((assignment) => assignment.id));
    const requests = [];
    const deletions = originalStaff
      .filter((assignment) => !currentIds.has(assignment.id))
      .map((assignment) =>
        authenticatedApiFetch({
          url: `/community/event-staff/${assignment.id}/`,
          method: "DELETE",
        }),
      );

    staff.forEach((assignment) => {
      if (!assignment.id) {
        requests.push(
          authenticatedApiFetch({
            url: "/community/event-staff/",
            method: "POST",
            payload: {
              event: eventId,
              user: assignment.user,
              assigned_role: assignment.assigned_role.trim(),
              notes: assignment.notes.trim(),
            },
          }),
        );
        return;
      }

      const original = originalById.get(assignment.id);
      if (
        original &&
        (original.assigned_role !== assignment.assigned_role.trim() ||
          (original.notes || "") !== assignment.notes.trim())
      ) {
        requests.push(
          authenticatedApiFetch({
            url: `/community/event-staff/${assignment.id}/`,
            method: "PATCH",
            payload: {
              assigned_role: assignment.assigned_role.trim(),
              notes: assignment.notes.trim(),
            },
          }),
        );
      }
    });

    const deleted = await Promise.all(deletions);
    const responses = [...deleted, ...(await Promise.all(requests))];
    const failed = responses.find((response) => response?.error);
    return failed
      ? failed.message || "no se pudo guardar todo el personal"
      : "";
  };

  const openEventForm = (type, event = null) => {
    loadUsers();
    setModal(type === "edit" ? { type, event } : { type });
  };

  return (
    <>
      <EventsPage
        drawerEvent={drawerEvent}
        error={error}
        events={visibleEvents}
        isLoading={isLoading}
        onCancel={() => {
          setModal({ type: "cancel", event: drawerEvent });
          setDrawerEvent(null);
        }}
        onCloseDrawer={() => setDrawerEvent(null)}
        onCreate={() => openEventForm("create")}
        onEdit={() => {
          openEventForm("edit", drawerEvent);
          setDrawerEvent(null);
        }}
        onNextPage={() => setPage((current) => Math.min(current + 1, totalPages))}
        onPreviousPage={() => setPage((current) => Math.max(current - 1, 1))}
        page={page}
        totalEvents={events.length}
        totalPages={totalPages}
        onView={setDrawerEvent}
      />
      <Modal
        onClose={() => setModal(null)}
        open={Boolean(modal)}
        title={
          modal?.type === "edit"
              ? "Editar Evento"
              : modal?.type === "cancel"
                ? "Cancelar Evento"
                : "Nuevo Evento"
        }
      >
        {modal?.type === "cancel" ? (
          <EventCancellation
            event={modal.event}
            isSubmitting={isCancelling}
            onCancel={() => setModal(null)}
            onConfirm={cancelEvent}
          />
        ) : (
          <EventForm
            canManageStaff={isAdmin}
            initialEvent={modal?.type === "edit" ? modal.event : null}
            onCancel={() => setModal(null)}
            onSubmit={modal?.type === "edit" ? updateEvent : createEvent}
            users={users}
          />
        )}
      </Modal>
      <Notification
        message={notification}
        onClose={() => setNotification("")}
      />
    </>
  );
}
