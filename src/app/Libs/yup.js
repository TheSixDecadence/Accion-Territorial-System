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
  recipient_name: Yup.string()
    .trim()
    .max(200, "El destinatario no puede superar 200 caracteres")
    .required("El destinatario es obligatorio"),
  recipient_phone: Yup.string()
    .trim()
    .max(20, "El teléfono no puede superar 20 caracteres"),
  item: Yup.string().trim().required("El artículo es obligatorio"),
  address: Yup.string().trim().required("La dirección es obligatoria"),
  address_confirmation_token: Yup.string().required(
    "Selecciona una dirección de los resultados",
  ),
  notes: Yup.string().trim(),
});
