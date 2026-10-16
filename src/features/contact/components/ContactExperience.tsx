"use client";

import { useState } from "react";

import Link from "next/link";

import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

type ContactReason = "comprar" | "vender" | "donar" | "general";

type ContactChannels = Readonly<{
  email: string;
  instagram: Readonly<{ href: string; label: string }> | null;
  whatsappUrl: string | null;
}>;

const reasons: ReadonlyArray<Readonly<{
  id: ContactReason;
  label: string;
  summary: string;
  detail: string;
  nextStep: string;
  href: string;
  accent: string;
  tint: string;
}>> = [
  {
    id: "comprar",
    label: "Comprar",
    summary: "Buscas una prenda o tienes dudas sobre una compra.",
    detail: "Te orientamos sobre cómo descubrir prendas únicas en REVA.",
    nextStep: "Explorar prendas",
    href: "/catalogo",
    accent: "#3d5a66",
    tint: "#e7eef0",
  },
  {
    id: "vender",
    label: "Vender",
    summary: "Quieres dar una nueva vida a prendas de tu clóset.",
    detail: "Conoce el proceso de recepción y venta antes de escribirnos.",
    nextStep: "Conocer cómo vender",
    href: "/vender",
    accent: "#705b78",
    tint: "#f1edf2",
  },
  {
    id: "donar",
    label: "Donar",
    summary: "Te interesa contribuir con prendas para una donación.",
    detail: "Consulta primero los pasos y criterios actuales para donar.",
    nextStep: "Conocer cómo donar",
    href: "/donar",
    accent: "#78434b",
    tint: "#f4edef",
  },
  {
    id: "general",
    label: "Consulta general",
    summary: "Tienes otra pregunta sobre REVA.",
    detail: "Cuéntanos qué necesitas y encontraremos el siguiente paso.",
    nextStep: "Cómo funciona REVA",
    href: "/como-funciona",
    accent: "#49616a",
    tint: "#edf1f1",
  },
];

/** Keeps reason selection interactive while contact destinations stay server-configured. */
export function ContactExperience({ channels }: Readonly<{ channels: ContactChannels }>) {
  const [selectedReason, setSelectedReason] = useState<ContactReason>("comprar");
  const selected = reasons.find((reason) => reason.id === selectedReason) ?? reasons[0];

  return (
    <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch lg:gap-12">
      <section
        id="contact-next-step"
        aria-label="Siguiente paso"
        aria-live="polite"
        className="order-2 flex flex-col justify-between rounded-[2rem] border border-reva-border/80 bg-white p-6 shadow-[0_24px_80px_-56px_rgba(32,53,61,0.7)] sm:p-9 lg:order-1"
        style={{ backgroundImage: `linear-gradient(145deg, ${selected.tint}, #ffffff 68%)` }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-reva-secondary">Tu ruta · {selected.label}</p>
          <div className="reva-contact-panel-content" key={selected.id}>
            <Heading className="mt-4 max-w-lg" level={2} variant="editorial">
              {selected.summary}
            </Heading>
            <Text className="mt-4 max-w-md text-reva-secondary" variant="body">{selected.detail}</Text>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start gap-5 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <Link
            className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-reva-action px-6 text-sm font-semibold text-reva-on-action transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-reva-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            href={channels.whatsappUrl ?? `mailto:${channels.email}`}
            {...(channels.whatsappUrl ? { target: "_blank", rel: "noreferrer" } : {})}
            aria-label={channels.whatsappUrl ? `Escribir a REVA por WhatsApp sobre ${selected.label.toLowerCase()}` : `Escribir a REVA por correo sobre ${selected.label.toLowerCase()}`}
          >
            {channels.whatsappUrl ? "Escribir por WhatsApp" : "Escribir por correo"}
            <span aria-hidden="true" className="text-lg transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">→</span>
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-reva-primary underline decoration-reva-border underline-offset-4 transition-colors hover:text-reva-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2"
            href={selected.href}
          >
            {selected.nextStep}
          </Link>
        </div>
      </section>

      <div className="order-1 flex flex-col lg:order-2">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-reva-secondary">Elige un tema</p>
        <div aria-label="Motivo de contacto" className="divide-y divide-reva-border border-y border-reva-border" role="group">
          {reasons.map((reason, index) => {
            const active = reason.id === selectedReason;
            return (
              <button
                aria-pressed={active}
                aria-controls="contact-next-step"
                className="group flex min-h-[4.75rem] w-full items-center gap-4 py-4 text-left transition-colors duration-200 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-reva-focus motion-reduce:transition-none sm:min-h-[5.25rem] sm:gap-5"
                key={reason.id}
                onClick={() => setSelectedReason(reason.id)}
                style={{ color: active ? reason.accent : undefined }}
                type="button"
              >
                <span aria-hidden="true" className="w-8 shrink-0 text-xs tabular-nums text-reva-secondary">0{index + 1}</span>
                <span
                  aria-hidden="true"
                  className="h-8 w-1 shrink-0 rounded-full transition-[height,background-color] duration-200 group-hover:h-10 motion-reduce:transition-none motion-reduce:group-hover:h-8"
                  style={{ backgroundColor: active ? reason.accent : "transparent" }}
                />
                <span className="flex-1">
                  <span className="block font-serif text-2xl leading-tight tracking-tight sm:text-[1.75rem]">{reason.label}</span>
                  <span className="mt-1 block text-sm leading-5 text-reva-secondary">{reason.summary}</span>
                </span>
                <span aria-hidden="true" className="pr-2 text-xl transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">↗</span>
              </button>
            );
          })}
        </div>

        <div className="mt-7 flex flex-col gap-4 border-t border-reva-border/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-reva-secondary">También puedes escribirnos</p>
            <a
              className="mt-2 inline-block break-all text-sm font-medium text-reva-primary underline decoration-reva-border underline-offset-4 transition-colors hover:text-reva-brand-strong focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2 sm:break-normal"
              href={`mailto:${channels.email}`}
            >
              {channels.email}
            </a>
          </div>
          {channels.instagram ? (
            <a
              className="inline-flex min-h-11 items-center self-start rounded-full border border-reva-border px-4 text-sm font-medium text-reva-primary transition-colors hover:border-reva-brand-strong hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus focus-visible:ring-offset-2 sm:self-auto"
              href={channels.instagram.href}
              rel="noreferrer"
              target="_blank"
            >
              Instagram <span className="ml-2 text-reva-secondary">{channels.instagram.label}</span>
              <span className="sr-only"> (abre en una pestaña nueva)</span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
