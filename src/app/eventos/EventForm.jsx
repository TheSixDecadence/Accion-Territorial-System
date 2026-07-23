"use client";

import { Field as FormikField, Form, Formik } from "formik";
import { getEventValidationSchema } from "@/app/Libs/yup";
import AddressSearch from "@/app/UI/Shared/AddressSearch";
import Button from "@/app/UI/Shared/Button";
import Field, { controlClass } from "@/app/UI/Shared/Field";

export default function EventForm({
  canManageStaff = false,
  initialEvent,
  onCancel,
  onSubmit,
  users = [],
}) {
  const isEditing = Boolean(initialEvent);
  const originalAddress = initialEvent?.address || "";

  return (
    <Formik
      initialValues={{
        title: initialEvent?.title || "",
        description: initialEvent?.description || "",
        event_date: initialEvent?.event_date || "",
        start_time: initialEvent?.start_time?.slice(0, 5) || "",
        end_time: initialEvent?.end_time?.slice(0, 5) || "",
        location_name: initialEvent?.location_name || "",
        address: originalAddress,
        latitude: initialEvent?.latitude || "",
        longitude: initialEvent?.longitude || "",
        address_confirmation_token: "",
        status: initialEvent?.status || "SCHEDULED",
        staff: (initialEvent?.staff || []).map((assignment) => ({
          id: assignment.id,
          user: assignment.user,
          user_detail: assignment.user_detail,
          assigned_role: assignment.assigned_role,
          notes: assignment.notes || "",
        })),
        staff_user: "",
        staff_role: "",
        staff_notes: "",
      }}
      onSubmit={onSubmit}
      validationSchema={getEventValidationSchema(originalAddress)}
    >
      {({ errors, isSubmitting, setFieldValue, status, touched, values }) => (
        <Form className="space-y-4" noValidate>
          <FormikField name="title">
            {({ field, meta }) => (
              <Field
                error={meta.touched ? meta.error : ""}
                htmlFor="event-title"
                label="Nombre"
              >
                <input
                  {...field}
                  autoFocus
                  className={controlClass}
                  id="event-title"
                  maxLength={150}
                  type="text"
                />
              </Field>
            )}
          </FormikField>

          <FormikField name="description">
            {({ field, meta }) => (
              <Field
                error={meta.touched ? meta.error : ""}
                htmlFor="event-description"
                label="Descripción"
              >
                <textarea
                  {...field}
                  className={`${controlClass} min-h-20 resize-y py-3`}
                  id="event-description"
                />
              </Field>
            )}
          </FormikField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormikField name="event_date">
              {({ field, meta }) => (
                <Field
                  error={meta.touched ? meta.error : ""}
                  htmlFor="event-date"
                  label="Fecha"
                >
                  <input
                    {...field}
                    className={controlClass}
                    id="event-date"
                    type="date"
                  />
                </Field>
              )}
            </FormikField>

            <FormikField name="status">
              {({ field, meta }) => (
                <Field
                  error={meta.touched ? meta.error : ""}
                  htmlFor="event-status"
                  label="Estado"
                >
                  <select
                    {...field}
                    className={controlClass}
                    id="event-status"
                  >
                    <option value="SCHEDULED">Programado</option>
                    <option value="IN_PROGRESS">En progreso</option>
                    <option value="COMPLETED">Completado</option>
                    <option value="CANCELLED">Cancelado</option>
                  </select>
                </Field>
              )}
            </FormikField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormikField name="start_time">
              {({ field, meta }) => (
                <Field
                  error={meta.touched ? meta.error : ""}
                  htmlFor="event-start-time"
                  label="Hora de inicio"
                >
                  <input
                    {...field}
                    className={controlClass}
                    id="event-start-time"
                    type="time"
                  />
                </Field>
              )}
            </FormikField>

            <FormikField name="end_time">
              {({ field, meta }) => (
                <Field
                  error={meta.touched ? meta.error : ""}
                  htmlFor="event-end-time"
                  label="Hora final"
                >
                  <input
                    {...field}
                    className={controlClass}
                    id="event-end-time"
                    type="time"
                  />
                </Field>
              )}
            </FormikField>
          </div>

          <FormikField name="location_name">
            {({ field, meta }) => (
              <Field
                error={meta.touched ? meta.error : ""}
                htmlFor="event-location"
                label="Lugar"
              >
                <input
                  {...field}
                  className={controlClass}
                  id="event-location"
                  maxLength={150}
                  type="text"
                />
              </Field>
            )}
          </FormikField>

          <AddressSearch
            error={
              touched.address || touched.address_confirmation_token
                ? errors.address_confirmation_token || errors.address || ""
                : ""
            }
            id="event-address"
            onChange={(value) => {
              setFieldValue("address", value);
              setFieldValue("address_confirmation_token", "");
              setFieldValue("latitude", "");
              setFieldValue("longitude", "");
            }}
            onSelect={(result) => {
              setFieldValue("address", result.full_address);
              setFieldValue(
                "address_confirmation_token",
                result.confirmation_token,
              );
              setFieldValue("latitude", result.latitude);
              setFieldValue("longitude", result.longitude);
            }}
            value={values.address}
          />

          {canManageStaff ? (
            <EventStaffSection
              setFieldValue={setFieldValue}
              users={users}
              values={values}
            />
          ) : null}

          {status ? (
            <p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)]"
              role="alert"
            >
              {status}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={onCancel} variant="secondary">
              Cancelar
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting
                ? "Guardando…"
                : isEditing
                  ? "Guardar Cambios"
                  : "Guardar Evento"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

function EventStaffSection({ setFieldValue, users, values }) {
  const addStaff = () => {
    if (!values.staff_user || !values.staff_role.trim()) return;

    const user = users.find((currentUser) => currentUser.id === values.staff_user);
    if (!user || values.staff.some((assignment) => assignment.user === user.id)) return;

    setFieldValue("staff", [
      ...values.staff,
      {
        user: user.id,
        user_detail: user,
        assigned_role: values.staff_role.trim(),
        notes: values.staff_notes.trim(),
      },
    ]);
    setFieldValue("staff_user", "");
    setFieldValue("staff_role", "");
    setFieldValue("staff_notes", "");
  };

  const updateAssignment = (index, field, value) => {
    setFieldValue(
      "staff",
      values.staff.map((assignment, currentIndex) =>
        currentIndex === index ? { ...assignment, [field]: value } : assignment,
      ),
    );
  };

  return (
    <section className="space-y-3 border-t border-[var(--color-border)] pt-4">
      <div>
        <h3 className="font-semibold">Personal</h3>
        <p className="text-xs text-[var(--color-text-muted)]">
          Asigna al personal que participará en el evento.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field htmlFor="event-staff-user" label="Usuario">
          <select
            className={controlClass}
            id="event-staff-user"
            onChange={(event) => setFieldValue("staff_user", event.target.value)}
            value={values.staff_user}
          >
            <option value="">Selecciona un usuario</option>
            {users
              .filter((user) => !values.staff.some((assignment) => assignment.user === user.id))
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {userName(user)}
                </option>
              ))}
          </select>
        </Field>
        <Field htmlFor="event-staff-role" label="Función">
          <input
            className={controlClass}
            id="event-staff-role"
            maxLength={100}
            onChange={(event) => setFieldValue("staff_role", event.target.value)}
            value={values.staff_role}
          />
        </Field>
      </div>
      <Button onClick={addStaff} variant="secondary">Agregar personal</Button>

      {values.staff.length ? (
        <div className="space-y-3 rounded-lg border border-[var(--color-border)] p-3">
          {values.staff.map((assignment, index) => (
            <div className="space-y-2 border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0" key={assignment.id || assignment.user}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{userName(assignment.user_detail)}</p>
                <Button
                  className="min-h-8 px-3 text-xs"
                  onClick={() => setFieldValue("staff", values.staff.filter((_, currentIndex) => currentIndex !== index))}
                  variant="danger"
                >
                  Quitar
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function userName(user) {
  if (!user) return "Usuario";
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;
}
