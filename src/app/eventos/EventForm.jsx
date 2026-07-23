"use client";

import { Field as FormikField, Form, Formik } from "formik";
import { eventValidationSchema } from "@/app/Libs/yup";
import Button from "@/app/UI/Shared/Button";
import Field, { controlClass } from "@/app/UI/Shared/Field";

export default function EventForm({ onCancel, onSubmit }) {
  return (
    <Formik
      initialValues={{
        title: "",
        description: "",
        event_date: "",
        start_time: "",
        end_time: "",
        location_name: "",
        address: "",
        status: "SCHEDULED",
      }}
      onSubmit={onSubmit}
      validationSchema={eventValidationSchema}
    >
      {({ isSubmitting, status }) => (
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

          <FormikField name="address">
            {({ field, meta }) => (
              <Field
                error={meta.touched ? meta.error : ""}
                htmlFor="event-address"
                label="Dirección"
              >
                <textarea
                  {...field}
                  className={`${controlClass} min-h-20 resize-y py-3`}
                  id="event-address"
                />
              </Field>
            )}
          </FormikField>

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
              {isSubmitting ? "Guardando…" : "Guardar Evento"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
