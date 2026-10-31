import Link from "next/link";

export type AdminSection = "products" | "requests" | "orders";

const sections: readonly Readonly<{ href: string; id: AdminSection; label: string }>[] = [
  { href: "/admin/productos", id: "products", label: "Gestión de Productos" },
  { href: "/admin/solicitudes", id: "requests", label: "Gestión de Solicitudes" },
  { href: "/admin/solicitudes/ordenes", id: "orders", label: "Gestión de Órdenes" },
];

/** Admin-only section navigation; callers must render it inside a server-authorized Admin route. */
export function AdminSectionNavigation({ activeSection }: Readonly<{ activeSection: AdminSection }>) {
  return (
    <nav aria-label="Secciones de administración" className="flex flex-wrap gap-2 border-b border-slate-200 px-4 py-4 sm:px-6 lg:px-8">
      {sections.map(({ href, id, label }) => (
        <Link
          aria-current={activeSection === id ? "page" : undefined}
          className={activeSection === id
            ? "inline-flex min-h-11 items-center rounded-full bg-reva-primary px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2"
            : "inline-flex min-h-11 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-reva-primary hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2"}
          href={href}
          key={id}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
