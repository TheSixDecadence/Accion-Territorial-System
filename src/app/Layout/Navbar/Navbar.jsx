"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/store/useAuth";

const moduleItems = [
  { label: "Rutas", href: "/rutas" },
  { label: "Eventos", href: "/eventos" },
  { label: "Articulos", href: "/articulos" },
  { label: "Distritos", href: "/distritos" },
];

const usersItem = { label: "Usuarios", href: "/usuarios" };
const reportsItem = { label: "Reportes", href: "/reportes" };

const Navbar = () => {
  const pathname = usePathname();
  const role = useAuth((state) => state.user?.role);
  const adminItems = role === "ADMIN" ? [usersItem, reportsItem] : [reportsItem];
  const navItems = [...moduleItems, ...adminItems];
  const activeItem =
    navItems.find((item) => {
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    })?.label ?? "Rutas";

  return (
    <aside
      className="sticky top-0 z-40 min-h-screen w-[72px] shrink-0 bg-[var(--color-primary)] px-2 py-5 text-white sm:w-[176px] sm:px-5 sm:py-6"
    >
      <Link href="/" className="block">
        <span className="hidden text-[11px] font-bold uppercase leading-tight sm:block">
          Accion Territorial
        </span>
        <span className="mt-1 hidden text-[10px] leading-tight text-white/80 sm:block">
          Subsecretaria de Vinculacion Ciudadana
        </span>
      </Link>

      <Link
        aria-label="Inicio"
        className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm font-bold sm:hidden"
        href="/"
      >
        AT
      </Link>

      <nav aria-label="Navegación principal" className="mt-8 sm:mt-9">
        <NavGroup activeItem={activeItem} items={moduleItems} title="Modulos" />
        <NavGroup
          activeItem={activeItem}
          className="mt-5"
          items={adminItems}
          title="Administracion"
        />
      </nav>
    </aside>
  );
};

const NavGroup = ({ activeItem, className = "", items, title }) => {
  return (
    <section className={className}>
      <p className="mb-2 hidden text-sm text-white/80 sm:block">{title}</p>
      <div className="space-y-2">
        {items.map((item) => {
          const isActive = item.label === activeItem;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`relative flex items-center justify-center rounded-md px-1 py-3 text-[9px] font-semibold uppercase transition sm:justify-start sm:px-3 sm:text-[11px] ${
                isActive
                  ? "bg-[var(--color-primary-soft)] shadow-md before:absolute before:inset-y-1 before:left-0 before:w-1 before:rounded-full before:bg-[var(--color-accent)]"
                  : "hover:bg-white/10"
              }`}
              href={item.href}
              key={item.href}
              title={item.label}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Navbar;
