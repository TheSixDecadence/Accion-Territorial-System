"use client";

import { Field as FormikField, Form, Formik } from "formik";
import { getUserValidationSchema } from "@/app/Libs/yup";
import Button from "@/app/UI/Shared/Button";
import Field, { controlClass } from "@/app/UI/Shared/Field";

const roles = [
  { label: "Administrador", value: "ADMIN" },
  { label: "Coordinador", value: "COORDINATOR" },
  { label: "Personal", value: "STAFF" },
];

export default function UserForm({ initialUser, onCancel, onSubmit }) {
  const isEditing = Boolean(initialUser);

  return (
    <Formik
      initialValues={{
        first_name: initialUser?.first_name || "",
        last_name: initialUser?.last_name || "",
        email: initialUser?.email || "",
        phone: initialUser?.phone || "",
        role: initialUser?.role || "COORDINATOR",
        password: "",
      }}
      onSubmit={onSubmit}
      validationSchema={getUserValidationSchema(isEditing)}
    >
      {({ isSubmitting, status }) => (
        <Form className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormControl label="Nombre" name="first_name" />
            <FormControl label="Apellidos" name="last_name" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormControl label="Correo electrónico" name="email" type="email" />
            <FormControl label="Teléfono" name="phone" type="tel" />
          </div>

          <FormikField name="role">
            {({ field, meta }) => (
              <Field error={meta.touched ? meta.error : ""} htmlFor="user-role" label="Rol">
                <select {...field} className={controlClass} id="user-role">
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </FormikField>

          {!isEditing ? (
            <FormControl label="Contraseña" name="password" type="password" />
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
            <Button disabled={isSubmitting} onClick={onCancel} variant="secondary">
              Cancelar
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Guardando…" : "Guardar Usuario"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

function FormControl({ label, name, type = "text" }) {
  return (
    <FormikField name={name}>
      {({ field, meta }) => (
        <Field
          error={meta.touched ? meta.error : ""}
          htmlFor={`user-${name}`}
          label={label}
        >
          <input
            {...field}
            autoComplete={name === "password" ? "new-password" : undefined}
            className={controlClass}
            id={`user-${name}`}
            type={type}
          />
        </Field>
      )}
    </FormikField>
  );
}
