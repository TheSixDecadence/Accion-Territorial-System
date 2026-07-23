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

export const getRoutePointValidationSchema = (originalAddress = "") =>
  Yup.object({
    route: Yup.string().trim().required("El ID de la ruta es obligatorio"),
    recipient_name: Yup.string()
      .trim()
      .max(200, "El destinatario no puede superar 200 caracteres")
      .required("El destinatario es obligatorio"),
    recipient_phone: Yup.string()
      .trim()
      .max(20, "El teléfono no puede superar 20 caracteres"),
    item: Yup.string().trim().required("El artículo es obligatorio"),
    address: Yup.string().trim().required("La dirección es obligatoria"),
    address_confirmation_token: Yup.string().test(
      "confirmed-address",
      "Selecciona una dirección de los resultados",
      (token, context) =>
        Boolean(token) || context.parent.address === originalAddress,
    ),
    status: Yup.string()
      .oneOf(["PENDING", "NOT_DELIVERED", "COMPLETED", "CANCELLED"])
      .required("El estado es obligatorio"),
    notes: Yup.string().trim(),
  });

export const getNewRouteValidationSchema = (isAdmin) =>
  Yup.object({
    name: Yup.string()
      .trim()
      .max(150, "El nombre no puede superar 150 caracteres")
      .required("El nombre es obligatorio"),
    description: Yup.string()
      .trim()
      .max(250, "La descripción no puede superar 250 caracteres")
      .required("La descripción es obligatoria"),
    coordinator_id: isAdmin
      ? Yup.string().required("El coordinador es obligatorio")
      : Yup.string(),
    scheduled_date: Yup.string().required("La fecha es obligatoria"),
    status: Yup.string().required("El estado es obligatorio"),
  });

export const eventValidationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .max(150, "El título no puede superar 150 caracteres")
    .required("El título es obligatorio"),
  description: Yup.string().trim(),
  event_date: Yup.string().required("La fecha es obligatoria"),
  start_time: Yup.string().required("La hora de inicio es obligatoria"),
  end_time: Yup.string().test(
    "after-start",
    "La hora final debe ser posterior a la hora de inicio",
    (endTime, context) =>
      !endTime ||
      !context.parent.start_time ||
      endTime > context.parent.start_time,
  ),
  location_name: Yup.string()
    .trim()
    .max(150, "El lugar no puede superar 150 caracteres")
    .required("El lugar es obligatorio"),
  address: Yup.string().trim().required("La dirección es obligatoria"),
  status: Yup.string()
    .oneOf(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .required("El estado es obligatorio"),
});
