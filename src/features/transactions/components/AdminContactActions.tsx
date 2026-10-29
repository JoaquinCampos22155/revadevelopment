"use client";

import { useState } from "react";

type Props = Readonly<{
  phone: string;
  whatsAppUrl: string | null;
}>;

export function AdminContactActions({ phone, whatsAppUrl }: Props) {
  const [copyStatus, setCopyStatus] = useState("");

  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(phone);
      setCopyStatus("Teléfono copiado.");
    } catch {
      setCopyStatus("No se pudo copiar. Selecciona el teléfono y cópialo manualmente.");
    }
  }

  return (
    <>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="inline-flex min-h-11 items-center rounded-full border border-reva-border bg-white px-4 text-sm font-semibold text-reva-primary hover:bg-reva-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus"
          onClick={copyPhone}
          type="button"
        >
          Copiar teléfono
        </button>
        {whatsAppUrl ? (
          <a
            className="inline-flex min-h-11 items-center rounded-full border border-reva-border bg-white px-4 text-sm font-semibold text-reva-primary hover:bg-reva-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reva-focus"
            href={whatsAppUrl}
            rel="noreferrer"
            target="_blank"
          >
            Abrir WhatsApp
          </a>
        ) : null}
      </div>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-slate-700" role="status">
        {copyStatus}
      </p>
    </>
  );
}
