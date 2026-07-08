"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const moduleItems = [
  { label: "Rutas", href: "/rutas" },
  { label: "Eventos", href: "/eventos" },
  { label: "Articulos", href: "/articulos" },
  { label: "Distritos", href: "/distritos" },
];

const adminItems = [
  { label: "Usuarios", href: "/usuarios" },
  { label: "Reportes", href: "/reportes" },
];

const navItems = [...moduleItems, ...adminItems];

const Navbar = () => {
  const pathname = usePathname();
  const activeItem =
    navItems.find((item) => {
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    })?.label ?? "Rutas";

  return (
    <aside
      className="min-h-screen w-[176px] shrink-0 bg-[#2E3180] px-5 py-6 text-[#F7F8F7]"
    >
      <Link href="/" className="block">
        <span className="block text-[11px] font-bold uppercase leading-tight">
          Accion Territorial
        </span>
        <span className="mt-1 block text-[10px] leading-tight text-[#F7F8F7]/80">
          Subsecretaria de Vinculacion Ciudadana
        </span>
      </Link>

      <nav className="mt-9">
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
      <p className="mb-2 text-sm text-[#F7F8F7]/80">{title}</p>
      <div className="space-y-2">
        {items.map((item) => {
          const isActive = item.label === activeItem;

          return (
            <Link
              className={`flex rounded-md px-3 py-3 text-[11px] font-semibold uppercase transition ${
                isActive
                  ? "bg-[#4A4EA8] shadow-md"
                  : "hover:bg-[#4A4EA8]/70"
              }`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Navbar;
