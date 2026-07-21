"use client";

import { Field as FormikField, Form, Formik } from "formik";
import { routeValidationSchema } from "@/app/Libs/yup";
import Button from "@/app/UI/Shared/Button";
import Field, { controlClass } from "@/app/UI/Shared/Field";

export default function RouteForm({ onCancel }) {
  return (
    <Formik
      initialValues={{
        name: "",
        description: "",
        coordinator: "",
        scheduled_date: "",
        status: "PENDING",
      }}
      onSubmit={(_, { setStatus, setSubmitting }) => {
        setStatus("El formulario está listo. Falta conectarlo al backend.");
        setSubmitting(false);
      }}
      validationSchema={routeValidationSchema}
    >
      {({ isSubmitting, status }) => (
        <Form className="space-y-4" noValidate>
          <FormikField name="name">
            {({ field, meta }) => (
              <Field
                error={meta.touched ? meta.error : ""}
                htmlFor="route-name"
                label="Nombre"
              >
                <input
                  {...field}
                  autoFocus
                  className={controlClass}
                  id="route-name"
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
                htmlFor="route-description"
                label="Descripción"
              >
                <textarea
                  {...field}
                  className={`${controlClass} min-h-24 resize-y py-3`}
                  id="route-description"
                  maxLength={250}
                />
              </Field>
            )}
          </FormikField>

          <FormikField name="coordinator">
            {({ field, meta }) => (
              <Field
                error={meta.touched ? meta.error : ""}
                htmlFor="route-coordinator"
                label="Coordinador"
              >
                <input
                  {...field}
                  className={controlClass}
                  id="route-coordinator"
                  type="text"
                />
              </Field>
            )}
          </FormikField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormikField name="scheduled_date">
              {({ field, meta }) => (
                <Field
                  error={meta.touched ? meta.error : ""}
                  htmlFor="route-date"
                  label="Fecha programada"
                >
                  <input
                    {...field}
                    className={controlClass}
                    id="route-date"
                    type="date"
                  />
                </Field>
              )}
            </FormikField>

            <FormikField name="status">
              {({ field, meta }) => (
                <Field
                  error={meta.touched ? meta.error : ""}
                  htmlFor="route-status"
                  label="Estado"
                >
                  <select
                    {...field}
                    className={controlClass}
                    id="route-status"
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="IN_PROGRESS">En progreso</option>
                    <option value="COMPLETED">Completada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
                </Field>
              )}
            </FormikField>
          </div>

          {status ? (
            <p
              className="rounded-lg bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text-muted)]"
              role="status"
            >
              {status}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={onCancel} variant="secondary">
              Cancelar
            </Button>
            <Button disabled={isSubmitting} type="submit">
              Guardar Ruta
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
