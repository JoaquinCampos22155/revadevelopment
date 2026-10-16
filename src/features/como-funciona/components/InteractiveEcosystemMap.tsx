"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";

import { Text } from "@/components/ui/Text";

const routes = [
  {
    id: "comprar",
    title: "Comprar",
    eyebrow: "Encontrar",
    description: "Descubre prendas físicas únicas, fotografiadas tal como son.",
    href: "#comprar",
    linkLabel: "Explorar prendas",
    desktopLinkLabel: "Explorar prendas",
    accent: "#3d5a66",
    icon: (
      <>
        <path d="M6 8h12l1 12H5L6 8Z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </>
    ),
  },
  {
    id: "vender",
    title: "Vender",
    eyebrow: "Volver a circular",
    description:
      "Reúne un lote de 15 prendas o más; REVA revisa y gestiona la venta de las elegibles.",
    href: "#vender",
    linkLabel: "Conocer Vender",
    desktopLinkLabel: "Ver la ruta de venta",
    accent: "#705b78",
    icon: (
      <>
        <path d="M5 20V5h14v15" />
        <path d="M5 10h14M9 5v15m6-15v15" />
      </>
    ),
  },
  {
    id: "donar",
    title: "Donar",
    eyebrow: "Compartir",
    description:
      "Elige donar desde el inicio. REVA revisa y reúne las prendas antes de coordinar una oportunidad.",
    href: "#donar",
    linkLabel: "Conocer Donar",
    desktopLinkLabel: "Ver la ruta de donación",
    accent: "#78434b",
    icon: (
      <path d="M20.8 8.8c0 4.5-8.8 10-8.8 10s-8.8-5.5-8.8-10a4.5 4.5 0 0 1 8.8-1.5 4.5 4.5 0 0 1 8.8 1.5Z" />
    ),
  },
] as const;

type RouteId = (typeof routes)[number]["id"];

function RouteIcon({ routeId }: Readonly<{ routeId: RouteId }>) {
  const route = routes.find(({ id }) => id === routeId);
  if (!route) return null;

  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6 fill-none stroke-current stroke-[1.5]"
      focusable="false"
      viewBox="0 0 24 24"
    >
      {route.icon}
    </svg>
  );
}

/** Small interactive route map; the desktop diagram nodes are direct route links. */
export function InteractiveEcosystemMap() {
  const [activeId, setActiveId] = useState<RouteId>("comprar");
  const activeRoute = routes.find(({ id }) => id === activeId) ?? routes[0];

  return (
    <section aria-label="Explora las rutas de REVA" className="mt-12 sm:mt-16" data-story-origin-mobile>
      <div className="relative mx-auto hidden min-h-[36rem] max-w-6xl lg:block">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          focusable="false"
          preserveAspectRatio="none"
          viewBox="0 0 1000 570"
        >
          <path className="ecosystem-thread" d="M335 289 C398 289 423 289 465 289" />
          <path className="ecosystem-thread" d="M535 267 C600 225 620 157 690 145" />
          <path className="ecosystem-thread" d="M535 311 C600 353 620 420 690 432" />
          {routes.map((route, index) => {
            const path = ["M335 289 C398 289 423 289 465 289", "M535 267 C600 225 620 157 690 145", "M535 311 C600 353 620 420 690 432"][index];
            const selected = activeId === route.id;
            return (
              <path
                aria-hidden="true"
                className="ecosystem-thread-active"
                d={path}
                key={route.id}
                pathLength="1"
                style={{
                  opacity: selected ? 1 : 0,
                  stroke: route.accent,
                  strokeDasharray: 1,
                  strokeDashoffset: selected ? 0 : 1,
                }}
              />
            );
          })}
        </svg>

        <div className="absolute left-1/2 top-1/2 z-10 grid h-44 w-44 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-reva-brand/45 bg-reva-surface text-center shadow-[0_20px_60px_-40px_rgba(32,53,61,0.55)]" data-story-origin-desktop>
          <span aria-hidden="true" className="absolute inset-2 rounded-full border border-reva-brand/15" />
          <div className="relative px-4">
            <p className="font-serif text-[2.6rem] leading-none tracking-tight text-reva-primary">REVA</p>
            <p className="mt-3 text-[0.62rem] font-medium uppercase leading-4 tracking-[0.16em] text-reva-secondary">
              conecta nuevas rutas
            </p>
          </div>
        </div>

        {routes.map((route, index) => {
          const placement = [
            "left-[2%] top-1/2 -translate-y-1/2",
            "right-[1%] top-[5%]",
            "right-[1%] bottom-[2%]",
          ][index];
          const selected = activeId === route.id;
          return (
            <Link
              className={`ecosystem-route absolute z-20 block w-[27%] cursor-pointer rounded-[2rem] border p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-4 focus-visible:ring-offset-reva-background ${placement}`}
              data-active={selected}
              key={route.id}
              onFocus={() => setActiveId(route.id)}
              onPointerEnter={() => setActiveId(route.id)}
              href={route.href}
              style={{ "--route-accent": route.accent } as CSSProperties}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-current/20 text-[color:var(--route-accent)] transition-colors duration-300 motion-reduce:transition-none">
                  <RouteIcon routeId={route.id} />
                </span>
                <span className="text-xs uppercase tracking-[0.14em] text-reva-secondary">{route.eyebrow}</span>
              </span>
              <span className="mt-5 block font-serif text-3xl text-reva-primary">{route.title}</span>
              <span className="mt-2 block max-w-xs text-sm leading-6 text-reva-secondary">{route.description}</span>
              <span className={`mt-5 block h-px origin-left bg-[var(--route-accent)] transition-transform duration-500 motion-reduce:transition-none ${selected ? "scale-x-100" : "scale-x-0"}`} />
              <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-reva-primary">
                {route.desktopLinkLabel}
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="lg:hidden">
        <div className="mx-auto grid h-32 w-32 place-items-center rounded-full border border-reva-brand/45 bg-reva-surface text-center shadow-[0_16px_45px_-35px_rgba(32,53,61,0.6)]">
          <div>
            <p className="font-serif text-3xl leading-none text-reva-primary">REVA</p>
            <p className="mt-2 text-[0.58rem] uppercase tracking-[0.13em] text-reva-secondary">conecta</p>
          </div>
        </div>
        <div className="relative mt-1">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-9 w-full overflow-visible"
            focusable="false"
            preserveAspectRatio="none"
            viewBox="0 0 300 36"
          >
            <path className="ecosystem-thread" d="M150 0 V10 C150 22 50 22 50 35" />
            <path className="ecosystem-thread" d="M150 0 V35" />
            <path className="ecosystem-thread" d="M150 0 V10 C150 22 250 22 250 35" />
            {routes.map((route, index) => {
              const d = ["M150 0 V10 C150 22 50 22 50 35", "M150 0 V35", "M150 0 V10 C150 22 250 22 250 35"][index];
              const selected = activeId === route.id;
              return (
                <path
                  className="ecosystem-thread-active"
                  d={d}
                  key={route.id}
                  pathLength="1"
                  style={{
                    opacity: selected ? 1 : 0,
                    stroke: route.accent,
                    strokeDasharray: 1,
                    strokeDashoffset: selected ? 0 : 1,
                  }}
                />
              );
            })}
          </svg>
          <div aria-label="Elige una ruta" className="relative grid grid-cols-3 gap-2 sm:gap-4" role="group">
          {routes.map((route) => {
            const selected = activeId === route.id;
            return (
              <button
                aria-pressed={selected}
                className={`grid min-h-[4.5rem] place-items-center gap-1 rounded-2xl border px-2 py-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2 focus-visible:ring-offset-reva-background motion-reduce:transition-none ${selected ? "bg-reva-surface" : "bg-reva-background"}`}
                key={route.id}
                onClick={() => setActiveId(route.id)}
                onFocus={() => setActiveId(route.id)}
                style={{ borderColor: selected ? route.accent : "var(--reva-border)", color: selected ? route.accent : "var(--reva-text-secondary)" }}
                type="button"
              >
                <RouteIcon routeId={route.id} />
                {route.title}
              </button>
            );
          })}
          </div>
        </div>
      </div>

      <div
        aria-live="polite"
        className="mx-auto mt-8 grid max-w-4xl gap-5 border-t border-reva-border pt-6 sm:grid-cols-[1fr_auto] sm:items-center lg:hidden"
        style={{ "--route-accent": activeRoute.accent } as CSSProperties}
      >
        <div>
          <Text className="text-[color:var(--route-accent)]" variant="label">{activeRoute.eyebrow}</Text>
          <p className="mt-1 font-serif text-2xl text-reva-primary">{activeRoute.title}, a tu manera.</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-reva-secondary">{activeRoute.description}</p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center gap-2 self-start font-medium text-reva-primary underline decoration-[var(--route-accent)] decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-4 focus-visible:ring-offset-reva-background sm:self-center"
          href={activeRoute.href}
        >
          {activeRoute.linkLabel}<span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
