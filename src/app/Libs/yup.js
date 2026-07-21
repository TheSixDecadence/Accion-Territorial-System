import * as Yup from "yup";

export const getUserLoginValidationSchema = () =>
  Yup.object({
    email: Yup.string()
      .email("Correo electrónico inválido")
      .required("El correo electrónico es obligatorio"),
    password: Yup.string().required("La contraseña es obligatoria"),
  });

export const getUserValidationSchema = (isEditing) =>
  Yup.object({
    first_name: Yup.string().trim().required("El nombre es obligatorio"),
    last_name: Yup.string().trim().required("Los apellidos son obligatorios"),
    email: Yup.string()
      .trim()
      .email("Correo electrónico inválido")
      .required("El correo es obligatorio"),
    phone: Yup.string().trim(),
    role: Yup.string()
      .oneOf(["ADMIN", "COORDINATOR", "STAFF"])
      .required(),
    password: isEditing
      ? Yup.string()
      : Yup.string()
          .min(8, "La contraseña debe tener al menos 8 caracteres")
          .required("La contraseña es obligatoria"),
  });

export const articleValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(100, "El nombre no puede superar 100 caracteres")
    .required("El nombre es obligatorio"),
  description: Yup.string()
    .trim()
    .max(250, "La descripción no puede superar 250 caracteres")
    .required("La descripción es obligatoria"),
});

export const routeValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(150, "El nombre no puede superar 150 caracteres")
    .required("El nombre es obligatorio"),
  description: Yup.string()
    .trim()
    .max(250, "La descripción no puede superar 250 caracteres")
    .required("La descripción es obligatoria"),
  coordinator: Yup.string().trim().required("El coordinador es obligatorio"),
  scheduled_date: Yup.string().required("La fecha es obligatoria"),
  status: Yup.string().required("El estado es obligatorio"),
});
