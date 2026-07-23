"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authenticatedApiFetch } from "@/app/Libs/apiFetch";
import { useAuth } from "@/app/store/useAuth";
import Button from "@/app/UI/Shared/Button";
import Modal from "@/app/UI/Shared/Modal";
import Notification from "@/app/UI/Shared/Notification";
import PageHeader from "@/app/UI/Shared/PageHeader";
import Pagination from "@/app/UI/Shared/Pagination";
import {
  Map,
  MapControls,
  MapFitBounds,
  MapGeoJSON,
  MapMarker,
} from "@/components/ui/map";
import NewRouteForm from "./NewRouteForm";
import RouteForm from "./RouteForm";

const CHIHUAHUA_CENTER = [-106.0889, 28.6353];
const ROUTES_PER_PAGE = 7;
const ROUTE_STATUS = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};
const POINT_STATUS = {
  PENDING: "Pendiente",
  NOT_DELIVERED: "No entregado",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

function RoutesPage({
  dataError,
  items,
  isLoading,
  onAddPoint,
  onCancelPoint,
  onCreate,
  onEdit,
  onSelectRoute,
  onViewRoute,
  routeError,
  routeGeometry,
  routePoints,
  routes,
  selectedRouteId,
}) {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [page, setPage] = useState(1);
  const [showRecords, setShowRecords] = useState(false);
  const selectedItem = items.find((item) => item.id === selectedPoint?.item);
  const selectedRoute = routes.find(
    (route) => route.id === selectedPoint?.route,
  );
  const routeAcceptsPoints =
    selectedRoute &&
    !["COMPLETED", "CANCELLED"].includes(selectedRoute.status);
  const pointCanChange =
    selectedPoint?.status !== "CANCELLED" &&
    selectedRoute?.status !== "CANCELLED";
  const totalPages = Math.max(1, Math.ceil(routes.length / ROUTES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visibleRoutes = routes.slice(
    (currentPage - 1) * ROUTES_PER_PAGE,
    currentPage * ROUTES_PER_PAGE,
  );
  const visiblePoints = useMemo(
    () =>
      selectedRouteId
        ? routePoints.filter((point) => point.route === selectedRouteId)
        : routePoints,
    [routePoints, selectedRouteId],
  );
  const visibleGeometry = selectedRouteId
    ? {
        ...routeGeometry,
        features: routeGeometry.features.filter(
          (feature) => feature.properties.routeId === selectedRouteId,
        ),
      }
    : routeGeometry;
  const selectedCoordinates = useMemo(
    () =>
      selectedRouteId
        ? visiblePoints
            .filter(hasCoordinates)
            .map((point) => [
              Number(point.longitude),
              Number(point.latitude),
            ])
        : [],
    [selectedRouteId, visiblePoints],
  );
  const toggleRecords = () => {
    if (showRecords) {
      setSelectedPoint(null);
      onSelectRoute(null);
    }
    setShowRecords((current) => !current);
  };

  return (
    <div className="flex min-h-screen w-full flex-1 flex-col bg-[var(--color-background)]">
      <PageHeader
        actionLabel="Nueva Ruta"
        onAction={onCreate}
        title="Rutas"
      />

      <section className="relative w-full flex-1 overflow-hidden px-5 py-6 sm:px-7 lg:px-10">
        <div className="relative h-[60vh] min-h-[520px] w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] lg:h-[calc(100vh-8.5rem)]">
          <Map
            center={CHIHUAHUA_CENTER}
            loading={isLoading}
            theme="light"
            zoom={11}
          >
            <MapFitBounds
              coordinates={selectedCoordinates}
              fallbackCenter={CHIHUAHUA_CENTER}
              fallbackZoom={11}
            />
            {visibleGeometry.features.length > 0 ? (
              <MapGeoJSON
                data={visibleGeometry}
                fill={false}
                id="delivery-routes"
                linePaint={{
                  "line-color": "#2e3180",
                  "line-opacity": 0.9,
                  "line-width": 4,
                }}
              />
            ) : null}
            {visiblePoints.filter(hasCoordinates).map((point) => (
              <MapMarker
                key={point.id}
                latitude={Number(point.latitude)}
                longitude={Number(point.longitude)}
                onClick={() => setSelectedPoint(point)}
              />
            ))}
            <MapControls position="top-right" />
          </Map>
          <Button
            aria-expanded={showRecords}
            className="absolute top-3 left-3 z-30 min-h-8 px-3 text-xs"
            onClick={toggleRecords}
            variant="secondary"
          >
            {showRecords ? "Ocultar registros" : "Registros"}
          </Button>
          {dataError || routeError ? (
            <p
              className="absolute top-14 left-3 z-10 max-w-sm rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-[var(--color-danger)] shadow-sm"
              role="alert"
            >
              {dataError || routeError}
            </p>
          ) : null}
          {selectedPoint && (
            <div className="absolute bottom-4 left-4 z-10 w-[min(22rem,calc(100%-2rem))] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-lg">
              <p className="font-semibold text-[var(--color-primary)]">
                {selectedPoint.recipient_name}
              </p>
              <p className="mt-1 text-sm">{selectedPoint.full_address}</p>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="font-medium">Artículo</dt>
                <dd>{selectedItem?.name || "—"}</dd>
                <dt className="font-medium">Teléfono</dt>
                <dd>{selectedPoint.recipient_phone || "—"}</dd>
                <dt className="font-medium">Estado</dt>
                <dd>
                  {POINT_STATUS[selectedPoint.status] || selectedPoint.status}
                </dd>
              </dl>
              {routeAcceptsPoints ? (
                <button
                  className="mt-3 mr-4 text-sm font-medium text-[var(--color-primary)]"
                  onClick={() => {
                    onAddPoint(selectedPoint.route);
                    setSelectedPoint(null);
                  }}
                  type="button"
                >
                  Agregar punto
                </button>
              ) : null}
              {pointCanChange ? (
                <>
                  <button
                    className="mt-3 mr-4 text-sm font-medium text-[var(--color-primary)]"
                    onClick={() => {
                      onEdit(selectedPoint);
                      setSelectedPoint(null);
                    }}
                    type="button"
                  >
                    Editar
                  </button>
                  <button
                    className="mt-3 mr-4 text-sm font-medium text-[var(--color-danger)]"
                    onClick={() => {
                      onCancelPoint(selectedPoint);
                      setSelectedPoint(null);
                    }}
                    type="button"
                  >
                    Cancelar punto
                  </button>
                </>
              ) : null}
              <button
                className="mt-3 text-sm font-medium text-[var(--color-primary)]"
                onClick={() => setSelectedPoint(null)}
                type="button"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>

        <aside
          aria-hidden={!showRecords}
          className={`absolute inset-y-6 right-5 z-20 w-[calc(100%-2.5rem)] overflow-y-auto rounded-l-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl transition-transform duration-300 ease-out sm:right-7 sm:w-[min(560px,calc(100%-3.5rem))] lg:right-10 lg:w-[min(44%,560px)] ${
            showRecords
              ? "translate-x-0"
              : "pointer-events-none translate-x-[calc(100%+3rem)]"
          }`}
          inert={!showRecords}
        >
          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <h2 className="font-semibold text-[var(--color-primary)]">
              Registros
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Rutas registradas
            </p>
          </div>

          {routes.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
              No hay rutas registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-xs">
                <thead className="text-[var(--color-text-muted)]">
                  <tr className="border-b border-[var(--color-border)]">
                    <RouteHeader>Nombre</RouteHeader>
                    <RouteHeader>Coordinador</RouteHeader>
                    <RouteHeader>Fecha</RouteHeader>
                    <RouteHeader>Estado</RouteHeader>
                    <RouteHeader>
                      <span className="sr-only">Acciones</span>
                    </RouteHeader>
                  </tr>
                </thead>
                <tbody>
                  {visibleRoutes.map((route) => (
                    <tr
                      className={`cursor-pointer border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-background)] ${
                        selectedRouteId === route.id
                          ? "bg-[var(--color-background)]"
                          : ""
                      }`}
                      key={route.id}
                      onClick={() => {
                        setSelectedPoint(null);
                        onSelectRoute(
                          selectedRouteId === route.id ? null : route.id,
                        );
                      }}
                    >
                      <RouteCell className="font-semibold text-[var(--color-primary)]">
                        {route.name}
                      </RouteCell>
                      <RouteCell>{coordinatorName(route.coordinator)}</RouteCell>
                      <RouteCell>
                        {formatRouteDate(route.scheduled_date)}
                      </RouteCell>
                      <RouteCell>
                        {ROUTE_STATUS[route.status] || route.status}
                      </RouteCell>
                      <RouteCell>
                        <Button
                          className="min-h-7 px-3 py-1 text-xs"
                          onClick={(event) => {
                            event.stopPropagation();
                            onViewRoute(route);
                          }}
                          variant="secondary"
                        >
                          Detalles
                        </Button>
                      </RouteCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {routes.length > 0 ? (
            <Pagination
              label={`Mostrando ${visibleRoutes.length} de ${routes.length} rutas`}
              onNext={() => setPage((current) => current + 1)}
              onPrevious={() => setPage((current) => current - 1)}
              page={currentPage}
              totalPages={totalPages}
            />
          ) : null}
        </aside>
      </section>
    </div>
  );
}

function RouteHeader({ children }) {
  return <th className="px-3 py-2 text-center font-normal">{children}</th>;
}

function RouteCell({ children, className = "" }) {
  return <td className={`px-3 py-3 text-center ${className}`}>{children}</td>;
}

function coordinatorName(coordinator) {
  if (!coordinator) return "—";
  return (
    `${coordinator.first_name || ""} ${coordinator.last_name || ""}`.trim() ||
    coordinator.email
  );
}

function formatRouteDate(date) {
  if (!date) return "—";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function RouteDetails({
  items,
  onCancel,
  onClose,
  onEdit,
  onEditPoint,
  points,
  route,
}) {
  const orderedPoints = [...points].sort(
    (a, b) => a.sequence_order - b.sequence_order,
  );

  return (
    <div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
        <dt className="font-semibold">Nombre</dt>
        <dd>{route.name}</dd>
        <dt className="font-semibold">Descripción</dt>
        <dd>{route.description || "—"}</dd>
        <dt className="font-semibold">Coordinador</dt>
        <dd>{coordinatorName(route.coordinator)}</dd>
        <dt className="font-semibold">Fecha</dt>
        <dd>{formatRouteDate(route.scheduled_date)}</dd>
        <dt className="font-semibold">Estado</dt>
        <dd>{ROUTE_STATUS[route.status] || route.status}</dd>
        <dt className="font-semibold">Puntos</dt>
        <dd>{points.length}</dd>
      </dl>

      <div className="mt-6 overflow-hidden rounded-lg border border-[var(--color-border)]">
        <h3 className="border-b border-[var(--color-border)] px-3 py-2 text-sm font-semibold">
          Puntos de entrega
        </h3>
        {orderedPoints.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-[var(--color-text-muted)]">
            Esta ruta no tiene puntos registrados.
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {orderedPoints.map((point) => {
              const item = items.find(
                (currentItem) => currentItem.id === point.item,
              );
              const canEdit =
                route.status !== "CANCELLED" &&
                point.status !== "CANCELLED";

              return (
                <div
                  className="border-b border-[var(--color-border)] p-3 text-sm last:border-b-0"
                  key={point.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--color-primary)]">
                        {point.sequence_order}. {point.recipient_name}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {point.full_address}
                      </p>
                      <p className="mt-1 text-xs">
                        {item?.name || "Sin artículo"} ·{" "}
                        {POINT_STATUS[point.status] || point.status}
                      </p>
                    </div>
                    {canEdit ? (
                      <Button
                        className="min-h-7 shrink-0 px-3 py-1 text-xs"
                        onClick={() => onEditPoint(point)}
                        variant="secondary"
                      >
                        Editar
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        {route.status !== "CANCELLED" ? (
          <>
            <Button onClick={onCancel} variant="danger">
              Cancelar Ruta
            </Button>
            <Button onClick={onEdit}>Editar Ruta</Button>
          </>
        ) : null}
        <Button onClick={onClose} variant="secondary">
          Cerrar
        </Button>
      </div>
    </div>
  );
}

function RouteCancellation({ isSubmitting, onCancel, onConfirm, route }) {
  return (
    <div>
      <p className="text-sm text-[var(--color-text-muted)]">
        La ruta <strong>{route.name}</strong> cambiará al estado cancelada. Sus
        datos permanecerán guardados.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <Button disabled={isSubmitting} onClick={onCancel} variant="secondary">
          Volver
        </Button>
        <Button disabled={isSubmitting} onClick={onConfirm} variant="danger">
          {isSubmitting ? "Cancelando…" : "Confirmar Cancelación"}
        </Button>
      </div>
    </div>
  );
}

function PointCancellation({
  isSubmitting,
  onCancel,
  onConfirm,
  routePoint,
}) {
  return (
    <div>
      <p className="text-sm text-[var(--color-text-muted)]">
        El punto de entrega de{" "}
        <strong>{routePoint.recipient_name}</strong> cambiará al estado
        cancelado. Sus datos permanecerán guardados.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <Button disabled={isSubmitting} onClick={onCancel} variant="secondary">
          Volver
        </Button>
        <Button disabled={isSubmitting} onClick={onConfirm} variant="danger">
          {isSubmitting ? "Cancelando…" : "Confirmar Cancelación"}
        </Button>
      </div>
    </div>
  );
}

function hasCoordinates(point) {
  return (
    point.latitude !== null &&
    point.latitude !== "" &&
    point.longitude !== null &&
    point.longitude !== "" &&
    Number.isFinite(Number(point.latitude)) &&
    Number.isFinite(Number(point.longitude))
  );
}

function getApiError(data) {
  if (!data || typeof data !== "object") return "";
  const firstError = Object.values(data).flat()[0];
  return typeof firstError === "string" ? firstError : "";
}

function groupRoutablePoints(routePoints) {
  const groups = new globalThis.Map();

  routePoints
    .filter((point) => point.status !== "CANCELLED" && hasCoordinates(point))
    .forEach((point) => {
      const points = groups.get(point.route) || [];
      points.push(point);
      groups.set(point.route, points);
    });

  return [...groups.entries()]
    .map(([routeId, points]) => [
      routeId,
      points.sort((a, b) => a.sequence_order - b.sequence_order),
    ])
    .filter(([, points]) => points.length >= 2);
}

function coordinatePayload(point) {
  return {
    latitude: Number(point.latitude),
    longitude: Number(point.longitude),
  };
}

function routeFeature(routeId, response) {
  const legs = response?.routes?.[0]?.legs || [];
  const coordinates = legs.flatMap((leg, index) => {
    const legCoordinates = leg?.path?.coordinates || [];
    return index === 0 ? legCoordinates : legCoordinates.slice(1);
  });

  if (coordinates.length < 2) {
    return null;
  }

  return {
    type: "Feature",
    properties: { routeId },
    geometry: {
      type: "LineString",
      coordinates,
    },
  };
}

function nextSequenceOrder(routePoints, routeId) {
  return (
    Math.max(
      0,
      ...routePoints
        .filter((point) => point.route === routeId)
        .map((point) => Number(point.sequence_order) || 0),
    ) + 1
  );
}

export default function Wrapper() {
  const user = useAuth((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const [modal, setModal] = useState(null);
  const [coordinators, setCoordinators] = useState([]);
  const [items, setItems] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [routePoints, setRoutePoints] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [notification, setNotification] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const [routeError, setRouteError] = useState("");

  useEffect(() => {
    if (!isAdmin) return;

    let active = true;

    const loadCoordinators = async () => {
      const response = await authenticatedApiFetch({ url: "/users/" });
      if (!active || response?.error) return;

      const users = Array.isArray(response) ? response : response.results || [];
      setCoordinators(
        users.filter(
          (candidate) =>
            candidate.role === "COORDINATOR" && candidate.is_active,
        ),
      );
    };

    loadCoordinators();
    return () => {
      active = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      const [itemsResponse, routesResponse, pointsResponse] = await Promise.all([
        authenticatedApiFetch({ url: "/delivery/items/" }),
        authenticatedApiFetch({ url: "/delivery/routes/" }),
        authenticatedApiFetch({ url: "/delivery/route-points/" }),
      ]);
      if (!active) return;

      const failedResponses = [
        itemsResponse,
        routesResponse,
        pointsResponse,
      ].filter((response) => response?.error);

      if (failedResponses.length > 0) {
        setDataError(
          failedResponses[0].message ||
            "No fue posible cargar toda la información de rutas.",
        );
      }

      if (!itemsResponse?.error) {
        setItems(
          Array.isArray(itemsResponse)
            ? itemsResponse
            : itemsResponse.results || [],
        );
      }

      if (!routesResponse?.error) {
        setRoutes(
          Array.isArray(routesResponse)
            ? routesResponse
            : routesResponse.results || [],
        );
      }

      if (!pointsResponse?.error) {
        setRoutePoints(
          Array.isArray(pointsResponse)
            ? pointsResponse
            : pointsResponse.results || [],
        );
      }

      setIsLoading(false);
    };

    loadData();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const routes = groupRoutablePoints(routePoints);

    const calculateRoutes = async () => {
      const results = await Promise.all(
        routes.map(async ([routeId, points]) => {
          const response = await authenticatedApiFetch({
            url: "/delivery/calculate-route/",
            method: "POST",
            payload: {
              origin: coordinatePayload(points[0]),
              destination: coordinatePayload(points.at(-1)),
              waypoints: points.slice(1, -1).map(coordinatePayload),
              traffic: "live",
              route_type: "fast",
              avoid_tolls: false,
            },
          });

          return {
            error: response?.error
              ? response.message || "No fue posible calcular una ruta."
              : "",
            feature: response?.error
              ? null
              : routeFeature(routeId, response),
          };
        }),
      );

      if (active) {
        const calculationError = results.find((result) => result.error);
        setRouteError(calculationError?.error || "");
        setRouteGeometry({
          type: "FeatureCollection",
          features: results.map((result) => result.feature).filter(Boolean),
        });
      }
    };

    calculateRoutes();
    return () => {
      active = false;
    };
  }, [routePoints]);

  const closeNotification = useCallback(() => setNotification(""), []);

  const createRoute = async (values, formikHelpers) => {
    const response = await authenticatedApiFetch({
      url: "/delivery/routes/",
      method: "POST",
      payload: {
        name: values.name.trim(),
        description: values.description.trim(),
        coordinator_id: isAdmin ? values.coordinator_id : user?.id,
        scheduled_date: values.scheduled_date,
        status: values.status,
      },
    });

    if (response?.error) {
      formikHelpers.setStatus(
        getApiError(response.data) ||
          response.message ||
          "No fue posible crear la ruta.",
      );
      formikHelpers.setSubmitting(false);
      return;
    }

    setRoutes((current) => [...current, response]);
    setSelectedRouteId(response.id);
    setModal({ type: "point", route: response });
  };

  const createRoutePoint = async (values, formikHelpers) => {
    const response = await authenticatedApiFetch({
      url: "/delivery/route-points/",
      method: "POST",
      payload: {
        route: values.route,
        item: values.item,
        recipient_name: values.recipient_name.trim(),
        recipient_phone: values.recipient_phone.trim(),
        address_confirmation_token: values.address_confirmation_token,
        sequence_order: values.sequence_order,
        status: values.status,
        notes: values.notes.trim(),
      },
    });

    if (response?.error) {
      formikHelpers.setStatus(
        getApiError(response.data) ||
          response.message ||
          "No fue posible guardar el punto de entrega.",
      );
      formikHelpers.setSubmitting(false);
      return;
    }

    setRoutePoints((current) => [...current, response]);
    setModal(null);
    setNotification("Punto de entrega creado correctamente");
  };

  const updateRoute = async (values, formikHelpers) => {
    const route = modal.route;
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      scheduled_date: values.scheduled_date,
      status: values.status,
    };

    if (isAdmin) payload.coordinator_id = values.coordinator_id;

    const response = await authenticatedApiFetch({
      url: `/delivery/routes/${route.id}/`,
      method: "PATCH",
      payload,
    });

    if (response?.error) {
      formikHelpers.setStatus(
        getApiError(response.data) ||
          response.message ||
          "No fue posible actualizar la ruta.",
      );
      formikHelpers.setSubmitting(false);
      return;
    }

    setRoutes((current) =>
      current.map((currentRoute) =>
        currentRoute.id === response.id ? response : currentRoute,
      ),
    );
    setModal(null);
    setNotification("Ruta actualizada correctamente");
  };

  const cancelRoute = async () => {
    const route = modal.route;
    setIsCancelling(true);

    const response = await authenticatedApiFetch({
      url: `/delivery/routes/${route.id}/`,
      method: "DELETE",
    });

    setIsCancelling(false);

    if (response?.error) {
      setNotification(
        response.message || "No fue posible cancelar la ruta.",
      );
      return;
    }

    setRoutes((current) =>
      current.map((currentRoute) =>
        currentRoute.id === route.id
          ? { ...currentRoute, status: "CANCELLED" }
          : currentRoute,
      ),
    );
    setModal(null);
    setNotification("Ruta cancelada correctamente");
  };

  const cancelRoutePoint = async () => {
    const routePoint = modal.routePoint;
    setIsCancelling(true);

    const response = await authenticatedApiFetch({
      url: `/delivery/route-points/${routePoint.id}/`,
      method: "DELETE",
    });

    setIsCancelling(false);

    if (response?.error) {
      setNotification(
        response.message || "No fue posible cancelar el punto de entrega.",
      );
      return;
    }

    setRoutePoints((current) =>
      current.map((point) =>
        point.id === routePoint.id
          ? { ...point, status: "CANCELLED" }
          : point,
      ),
    );
    setModal(null);
    setNotification("Punto de entrega cancelado correctamente");
  };

  const updateRoutePoint = async (values, formikHelpers) => {
    const routePoint = modal.routePoint;
    const payload = {
      route: values.route,
      item: values.item,
      recipient_name: values.recipient_name.trim(),
      recipient_phone: values.recipient_phone.trim(),
      sequence_order: values.sequence_order,
      status: values.status,
      notes: values.notes.trim(),
    };

    if (values.address_confirmation_token) {
      payload.address_confirmation_token = values.address_confirmation_token;
    }

    const response = await authenticatedApiFetch({
      url: `/delivery/route-points/${routePoint.id}/`,
      method: "PUT",
      payload,
    });

    if (response?.error) {
      formikHelpers.setStatus(
        getApiError(response.data) ||
          response.message ||
          "No fue posible actualizar el punto de entrega.",
      );
      formikHelpers.setSubmitting(false);
      return;
    }

    setRoutePoints((current) =>
      current.map((point) => (point.id === response.id ? response : point)),
    );
    setModal(null);
    setNotification("Punto de entrega actualizado correctamente");
  };

  return (
    <>
      <RoutesPage
        dataError={dataError}
        items={items}
        isLoading={isLoading}
        onAddPoint={(routeId) =>
          setModal({
            type: "point",
            route: {
              id: routeId,
              sequenceOrder: nextSequenceOrder(routePoints, routeId),
            },
          })
        }
        onCancelPoint={(routePoint) =>
          setModal({ type: "pointCancel", routePoint })
        }
        onCreate={() => setModal({ type: "route" })}
        onEdit={(routePoint) => setModal({ type: "edit", routePoint })}
        onSelectRoute={setSelectedRouteId}
        onViewRoute={(route) => setModal({ type: "routeDetails", route })}
        routeError={routeError}
        routeGeometry={routeGeometry}
        routePoints={routePoints}
        routes={routes}
        selectedRouteId={selectedRouteId}
      />
      <Modal
        onClose={() => setModal(null)}
        open={Boolean(modal)}
        title={
          modal?.type === "routeDetails"
            ? "Detalles de la Ruta"
            : modal?.type === "routeEdit"
              ? "Editar Ruta"
              : modal?.type === "routeCancel"
                ? "Cancelar Ruta"
                : modal?.type === "pointCancel"
                  ? "Cancelar Punto de Entrega"
                : modal?.type === "edit"
            ? "Editar Punto de Entrega"
            : modal?.type === "point"
              ? "Punto de Entrega"
              : "Nueva Ruta"
        }
      >
        {modal?.type === "routeDetails" ? (
          <RouteDetails
            items={items}
            onCancel={() =>
              setModal({ type: "routeCancel", route: modal.route })
            }
            onClose={() => setModal(null)}
            onEdit={() => setModal({ type: "routeEdit", route: modal.route })}
            onEditPoint={(routePoint) =>
              setModal({ type: "edit", routePoint })
            }
            points={routePoints.filter(
              (point) => point.route === modal.route.id,
            )}
            route={modal.route}
          />
        ) : modal?.type === "routeCancel" ? (
          <RouteCancellation
            isSubmitting={isCancelling}
            onCancel={() =>
              setModal({ type: "routeDetails", route: modal.route })
            }
            onConfirm={cancelRoute}
            route={modal.route}
          />
        ) : modal?.type === "routeEdit" ? (
          <NewRouteForm
            coordinators={coordinators}
            initialRoute={modal.route}
            isAdmin={isAdmin}
            onCancel={() => setModal(null)}
            onSubmit={updateRoute}
          />
        ) : modal?.type === "pointCancel" ? (
          <PointCancellation
            isSubmitting={isCancelling}
            onCancel={() => setModal(null)}
            onConfirm={cancelRoutePoint}
            routePoint={modal.routePoint}
          />
        ) : modal?.type === "edit" ? (
          <RouteForm
            items={items}
            onCancel={() => setModal(null)}
            onSubmit={updateRoutePoint}
            routePoint={modal.routePoint}
          />
        ) : modal?.type === "point" ? (
          <RouteForm
            items={items}
            onCancel={() => setModal(null)}
            onSubmit={createRoutePoint}
            routeId={modal.route.id}
            sequenceOrder={modal.route.sequenceOrder}
          />
        ) : (
          <NewRouteForm
            coordinators={coordinators}
            isAdmin={isAdmin}
            onCancel={() => setModal(null)}
            onSubmit={createRoute}
          />
        )}
      </Modal>
      <Notification message={notification} onClose={closeNotification} />
    </>
  );
}
