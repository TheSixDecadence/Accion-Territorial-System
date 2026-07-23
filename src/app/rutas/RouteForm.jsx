"use client";

import { useEffect, useState } from "react";
import { Field as FormikField, Form, Formik } from "formik";
import { authenticatedApiFetch } from "@/app/Libs/apiFetch";
import { getRoutePointValidationSchema } from "@/app/Libs/yup";
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

function AddressSearch({ error, onChange, onSelect, value }) {
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(value);

  useEffect(() => {
    const query = value.trim();

    if (query.length < 3 || query === selectedAddress) {
      return;
    }

    let active = true;
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");

      const response = await authenticatedApiFetch({
        url: `/delivery/address-search/?q=${encodeURIComponent(query)}`,
      });
      if (!active) return;

      if (response?.error) {
        setResults([]);
        setSearchError(
          response.message || "No fue posible buscar la dirección.",
        );
      } else {
        setResults(response.results || []);
      }

      setIsSearching(false);
    }, 400);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [selectedAddress, value]);

  const selectResult = (result) => {
    setSelectedAddress(result.full_address);
    setResults([]);
    onSelect(result);
  };

  return (
    <Field
      error={error || searchError}
      htmlFor="delivery-address"
      label="Dirección"
    >
      <div className="relative">
        <input
          autoComplete="off"
          className={controlClass}
          id="delivery-address"
          onChange={(event) => {
            setSelectedAddress("");
            setResults([]);
            setSearchError("");
            setIsSearching(false);
            onChange(event.target.value);
          }}
          type="text"
          value={value}
        />

        {isSearching ? (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Buscando dirección…
          </p>
        ) : null}

        {results.length > 0 ? (
          <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
            {results.map((result) => (
              <li key={`${result.tomtom_place_id}-${result.latitude}`}>
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-background)]"
                  onClick={() => selectResult(result)}
                  type="button"
                >
                  {result.full_address}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Field>
  );
}
