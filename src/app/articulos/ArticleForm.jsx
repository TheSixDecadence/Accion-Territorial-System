"use client";

import { Field as FormikField, Form, Formik } from "formik";
import * as Yup from "yup";
import Button from "@/app/UI/Shared/Button";
import Field, { controlClass } from "@/app/UI/Shared/Field";

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(100, "El nombre no puede superar 100 caracteres")
    .required("El nombre es obligatorio"),
  description: Yup.string()
    .trim()
    .max(250, "La descripción no puede superar 250 caracteres")
    .required("La descripción es obligatoria"),
});

export default function ArticleForm({ initialArticle, onCancel, onSubmit }) {
  return (
    <Formik
      initialValues={{
        name: initialArticle?.name || "",
        description: initialArticle?.description || "",
      }}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    >
      {({ isSubmitting, status }) => (
        <Form className="space-y-4" noValidate>
          <FormikField name="name">
            {({ field, meta }) => (
              <Field
                error={meta.touched ? meta.error : ""}
                htmlFor="article-name"
                label="Nombre"
              >
                <input
                  {...field}
                  autoFocus
                  className={controlClass}
                  id="article-name"
                  maxLength={100}
                  type="text"
                />
              </Field>
            )}
          </FormikField>

          <FormikField name="description">
            {({ field, meta }) => (
              <Field
                error={meta.touched ? meta.error : ""}
                htmlFor="article-description"
                label="Descripción"
              >
                <textarea
                  {...field}
                  className={`${controlClass} min-h-24 resize-y py-3`}
                  id="article-description"
                  maxLength={250}
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
            <Button disabled={isSubmitting} onClick={onCancel} variant="secondary">
              Cancelar
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
