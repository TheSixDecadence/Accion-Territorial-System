"use client";

import { Field as FormikField, Form, Formik } from "formik";
import { getNewRouteValidationSchema } from "@/app/Libs/yup";
import Button from "@/app/UI/Shared/Button";
import Field, { controlClass } from "@/app/UI/Shared/Field";

function getCoordinatorName(coordinator) {
  return (
    [coordinator.first_name, coordinator.last_name].filter(Boolean).join(" ") ||
    coordinator.email ||
    "Sin nombre"
  );
}

export default function NewRouteForm({
  coordinators,
  isAdmin,
  onCancel,
  onSubmit,
}) {
  return (
    <Formik
      initialValues={{
        name: "",
        description: "",
        coordinator_id: "",
        scheduled_date: "",
        status: "PENDING",
      }}
      onSubmit={onSubmit}
      validationSchema={getNewRouteValidationSchema(isAdmin)}
    >
      {({ isSubmitting, status }) => (
        <Form className="space-y-4" noValidate>
          <FormikField name="name">
            {({ field, meta }) => (
              <Field
                error={meta.touched ? meta.error : ""}
                htmlFor="new-route-name"
                label="Nombre"
              >
                <input
                  {...field}
                  autoFocus
                  className={controlClass}
                  id="new-route-name"
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
                htmlFor="new-route-description"
                label="Descripción"
              >
                <textarea
                  {...field}
                  className={`${controlClass} min-h-24 resize-y py-3`}
                  id="new-route-description"
                  maxLength={250}
                />
              </Field>
            )}
          </FormikField>

          {isAdmin ? (
            <FormikField name="coordinator_id">
              {({ field, meta }) => (
                <Field
                  error={meta.touched ? meta.error : ""}
                  htmlFor="new-route-coordinator"
                  label="Coordinador"
                >
                  <select
                    {...field}
                    className={controlClass}
                    id="new-route-coordinator"
                  >
                    <option value="">Seleccionar coordinador</option>
                    {coordinators.map((coordinator) => (
                      <option key={coordinator.id} value={coordinator.id}>
                        {getCoordinatorName(coordinator)}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </FormikField>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormikField name="scheduled_date">
              {({ field, meta }) => (
                <Field
                  error={meta.touched ? meta.error : ""}
                  htmlFor="new-route-date"
                  label="Fecha programada"
                >
                  <input
                    {...field}
                    className={controlClass}
                    id="new-route-date"
                    type="date"
                  />
                </Field>
              )}
            </FormikField>

            <FormikField name="status">
              {({ field, meta }) => (
                <Field
                  error={meta.touched ? meta.error : ""}
                  htmlFor="new-route-status"
                  label="Estado"
                >
                  <select
                    {...field}
                    className={controlClass}
                    id="new-route-status"
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
              {isSubmitting ? "Guardando…" : "Crear Ruta"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
