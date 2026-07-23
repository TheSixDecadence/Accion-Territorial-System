"use client";

import { Field as FormikField, Form, Formik } from "formik";
import { getRoutePointValidationSchema } from "@/app/Libs/yup";
import AddressSearch from "@/app/UI/Shared/AddressSearch";
import Button from "@/app/UI/Shared/Button";
import Field, { controlClass } from "@/app/UI/Shared/Field";

export default function RouteForm({
  items,
  onCancel,
  onSubmit,
  routeId,
  routePoint,
  sequenceOrder = 1,
}) {
  const originalAddress = routePoint?.full_address || "";

  return (
    <Formik
      initialValues={{
        route: routeId || routePoint?.route || "",
        recipient_name: routePoint?.recipient_name || "",
        recipient_phone: routePoint?.recipient_phone || "",
        item: routePoint?.item || "",
        address: originalAddress,
        latitude: routePoint?.latitude || "",
        longitude: routePoint?.longitude || "",
        address_confirmation_token: "",
        sequence_order: routePoint?.sequence_order || sequenceOrder,
        status: routePoint?.status || "PENDING",
        notes: routePoint?.notes || "",
      }}
      onSubmit={onSubmit}
      validationSchema={getRoutePointValidationSchema(originalAddress)}
    >
      {({ errors, isSubmitting, setFieldValue, status, touched, values }) => (
        <Form className="space-y-4" noValidate>
          <FormikField name="recipient_name">
            {({ field, meta }) => (
              <Field
                error={meta.touched ? meta.error : ""}
                htmlFor="delivery-recipient"
                label="Destinatario"
              >
                <input
                  {...field}
                  autoFocus
                  className={controlClass}
                  id="delivery-recipient"
                  maxLength={200}
                  type="text"
                />
              </Field>
            )}
          </FormikField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormikField name="recipient_phone">
              {({ field, meta }) => (
                <Field
                  error={meta.touched ? meta.error : ""}
                  htmlFor="delivery-phone"
                  label="Teléfono"
                >
                  <input
                    {...field}
                    className={controlClass}
                    id="delivery-phone"
                    maxLength={20}
                    type="tel"
                  />
                </Field>
              )}
            </FormikField>

            <FormikField name="item">
              {({ field, meta }) => (
                <Field
                  error={meta.touched ? meta.error : ""}
                  htmlFor="delivery-item"
                  label="Artículo"
                >
                  <select
                    {...field}
                    className={controlClass}
                    id="delivery-item"
                  >
                    <option value="">Seleccionar artículo</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </FormikField>
          </div>

          <AddressSearch
            error={
              touched.address || touched.address_confirmation_token
                ? errors.address_confirmation_token || errors.address || ""
                : ""
            }
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

          <FormikField name="notes">
            {({ field, meta }) => (
              <Field
                error={meta.touched ? meta.error : ""}
                htmlFor="delivery-notes"
                label="Notas"
              >
                <textarea
                  {...field}
                  className={`${controlClass} min-h-20 resize-y py-3`}
                  id="delivery-notes"
                />
              </Field>
            )}
          </FormikField>

          <FormikField name="status">
            {({ field, meta }) => (
              <Field
                error={meta.touched ? meta.error : ""}
                htmlFor="delivery-status"
                label="Estado"
              >
                <select
                  {...field}
                  className={controlClass}
                  id="delivery-status"
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="NOT_DELIVERED">No entregado</option>
                  <option value="COMPLETED">Completado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </Field>
            )}
          </FormikField>

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
              {routePoint ? "Guardar Cambios" : "Guardar Punto"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
