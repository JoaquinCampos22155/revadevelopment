/* Signed private preview URLs are short-lived, so Next Image caching is intentionally avoided here. */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { useState, type DragEvent } from "react";

import type { ProductManagerImage } from "@/features/product-manager/server/product-media.types";

type UploadStatus = "failed" | "processing" | "uploaded" | "waiting";

type UploadItem = Readonly<{
  id: string;
  message?: string;
  name: string;
  status: UploadStatus;
}>;

type Props = Readonly<{
  images: ReadonlyArray<ProductManagerImage>;
  productId: string;
  readOnly?: boolean;
}>;

const uploadStatusLabel: Readonly<Record<UploadStatus, string>> = {
  failed: "No se pudo cargar",
  processing: "Procesando",
  uploaded: "Cargada",
  waiting: "En espera",
};

/**
 * Keeps independent, sequential upload progress visible so one rejected source
 * image never obscures or cancels the result of the remaining selection.
 */
export function ProductMediaManager({ images, productId, readOnly = false }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploads, setUploads] = useState<ReadonlyArray<UploadItem>>([]);

  async function call(method: string, body?: BodyInit, query = "") {
    const response = await fetch(`/admin/productos/${productId}/fotos${query}`, {
      body,
      headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
      method,
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      throw new Error(data.error ?? "No fue posible procesar esta imagen.");
    }
  }

  function updateUpload(id: string, update: Partial<UploadItem>) {
    setUploads((current) => current.map((item) => (item.id === id ? { ...item, ...update } : item)));
  }

  async function upload(files: FileList | ReadonlyArray<File> | null) {
    if (!files) return;

    const selectedFiles = Array.from(files);
    const selectedUploads = selectedFiles.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}`,
      name: file.name,
      status: "waiting" as const,
    }));

    setBusy(true);
    setMessage(null);
    setUploads(selectedUploads);

    let successfulUploads = 0;
    for (let index = 0; index < selectedFiles.length; index += 1) {
      const file = selectedFiles[index];
      const uploadItem = selectedUploads[index];
      updateUpload(uploadItem.id, { status: "processing" });

      try {
        const form = new FormData();
        form.append("file", file);
        await call("POST", form);
        successfulUploads += 1;
        updateUpload(uploadItem.id, { status: "uploaded" });
      } catch (error) {
        updateUpload(uploadItem.id, {
          message: safeUploadError(error),
          status: "failed",
        });
      }
    }

    if (successfulUploads > 0) {
      router.refresh();
    }

    const failedUploads = selectedFiles.length - successfulUploads;
    setMessage(
      failedUploads === 0
        ? `${successfulUploads} ${successfulUploads === 1 ? "foto cargada" : "fotos cargadas"}.`
        : `${successfulUploads} cargada(s); ${failedUploads} requiere(n) atención.`,
    );
    setBusy(false);
  }

  async function change(method: string, body?: unknown, query = "") {
    setBusy(true);
    try {
      await call(method, body ? JSON.stringify(body) : undefined, query);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible actualizar las fotos.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="product-media-heading" className="space-y-4 rounded-2xl border border-reva-border bg-reva-surface p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-reva-primary" id="product-media-heading">Fotos</h2>
        <p className="mt-1 text-sm leading-6 text-reva-secondary">{readOnly ? "Las fotos de un producto publicado se editan al retirarlo de publicación." : "La primera foto es principal. Puedes seleccionar varias; se procesan una por una."}</p>
      </div>

      {!readOnly ? <label className={`block cursor-pointer rounded-xl border border-dashed p-5 text-center text-sm font-medium transition ${isDropTarget ? "border-reva-brand bg-reva-muted text-reva-primary" : "border-reva-border bg-reva-background text-reva-primary hover:border-reva-brand"}`} onDragEnter={(event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); setIsDropTarget(true); }} onDragLeave={(event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); setIsDropTarget(false); }} onDragOver={(event: DragEvent<HTMLLabelElement>) => event.preventDefault()} onDrop={(event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); setIsDropTarget(false); void upload(event.dataTransfer.files); }}>
        <span className="block">Arrastra fotos aquí o selecciónalas desde tu dispositivo</span>
        <span className="mt-1 block font-normal text-reva-secondary">JPG o PNG · hasta 12 MiB por archivo · se procesan una por una</span>
        <input
          accept="image/jpeg,image/png"
          className="sr-only"
          disabled={busy}
          multiple
          onChange={(event) => {
            void upload(event.target.files);
            event.target.value = "";
          }}
          type="file"
        />
      </label> : null}

      {uploads.length > 0 ? (
        <ul aria-label="Estado de las fotos seleccionadas" className="space-y-2 text-sm">
          {uploads.map((upload) => (
            <li className="rounded-lg border border-reva-border bg-reva-background p-3" key={upload.id}>
              <p className="font-medium text-reva-primary">{upload.name}</p>
              <p aria-live="polite" className="mt-1 text-reva-secondary">{uploadStatusLabel[upload.status]}</p>
              {upload.message ? <p className="mt-1 text-reva-danger">{upload.message}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}

      {message ? <p aria-live="polite" className="text-sm text-reva-secondary">{message}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((image, index) => (
          <figure className="rounded-xl border border-reva-border bg-reva-background p-3" key={image.id}>
            <div className="relative"><img alt={image.altText} className="aspect-square w-full rounded-lg object-cover" height={image.height} src={image.previewUrl} width={image.width} />{image.position === 1 ? <span className="absolute left-2 top-2 rounded-full bg-reva-action px-2 py-1 text-xs font-medium text-reva-on-action">Principal</span> : null}</div>
            <figcaption className="mt-2 text-sm text-reva-secondary">{image.position === 1 ? "Foto 1" : `Foto ${image.position}`}</figcaption>
            {!readOnly ? <label className="mt-2 block text-sm font-medium text-reva-primary">
              Texto alternativo
              <input
                className="mt-1 min-h-11 w-full rounded-lg border border-reva-border bg-reva-surface px-3 text-reva-primary outline-none focus:border-reva-brand focus:ring-2 focus:ring-reva-focus/25"
                defaultValue={image.altText}
                disabled={busy}
                onBlur={(event) => {
                  if (event.target.value !== image.altText) {
                    void change("PATCH", { action: "alt", altText: event.target.value, imageId: image.id });
                  }
                }}
              />
            </label> : null}
            {!readOnly ? <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <button className="min-h-11 rounded-lg border border-reva-border px-3 text-reva-primary disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || index === 0} onClick={() => void change("PATCH", { action: "reorder", imageIds: moveImage(images, index, index - 1) })} type="button">Antes</button>
              <button className="min-h-11 rounded-lg border border-reva-border px-3 text-reva-primary disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || index === images.length - 1} onClick={() => void change("PATCH", { action: "reorder", imageIds: moveImage(images, index, index + 1) })} type="button">Después</button>
              <button className="min-h-11 rounded-lg px-3 text-reva-danger underline decoration-reva-border underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50" disabled={busy} onClick={() => { if (confirm("¿Eliminar esta foto?")) void change("DELETE", undefined, `?imageId=${image.id}`); }} type="button">Eliminar</button>
            </div> : null}
          </figure>
        ))}
      </div>
    </section>
  );
}

function moveImage(images: ReadonlyArray<ProductManagerImage>, fromIndex: number, toIndex: number): string[] {
  const reordered = [...images];
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);
  return reordered.map((image) => image.id);
}

function safeUploadError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("máximo permitido")) return "El archivo supera el tamaño máximo permitido.";
  if (message.includes("JPG") || message.includes("PNG")) return "El formato no es compatible. Solo se aceptan JPG o PNG.";
  return "Hubo un problema procesando esta imagen.";
}
