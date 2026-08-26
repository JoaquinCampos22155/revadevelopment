/* Signed private preview URLs are short-lived, so Next Image caching is intentionally avoided here. */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

  async function upload(files: FileList | null) {
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
    <section aria-labelledby="product-media-heading" className="space-y-4 border-t border-slate-200 pt-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-950" id="product-media-heading">Fotos</h2>
        <p className="mt-1 text-sm text-slate-600">{readOnly ? "Las fotos de un producto publicado se editan al retirarlo de publicación." : "La primera foto es principal. Puedes seleccionar varias; se procesan una por una."}</p>
      </div>

      {!readOnly ? <label className="block rounded-xl border border-dashed border-slate-300 p-4 text-sm font-medium">
        Seleccionar fotos
        <input
          accept="image/jpeg,image/png"
          className="mt-2 block w-full"
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
            <li className="rounded-lg border border-slate-200 p-3" key={upload.id}>
              <p className="font-medium text-slate-950">{upload.name}</p>
              <p aria-live="polite" className="mt-1 text-slate-600">{uploadStatusLabel[upload.status]}</p>
              {upload.message ? <p className="mt-1 text-rose-700">{upload.message}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}

      {message ? <p aria-live="polite" className="text-sm">{message}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((image, index) => (
          <figure className="rounded-xl border border-slate-200 p-3" key={image.id}>
            <img alt={image.altText} className="aspect-square w-full rounded-lg object-cover" height={image.height} src={image.previewUrl} width={image.width} />
            <figcaption className="mt-2 text-sm">{image.position === 1 ? "Foto principal" : `Foto ${image.position}`}</figcaption>
            {!readOnly ? <label className="mt-2 block text-sm">
              Texto alternativo
              <input
                className="mt-1 w-full rounded border border-slate-300 p-2"
                defaultValue={image.altText}
                disabled={busy}
                onBlur={(event) => {
                  if (event.target.value !== image.altText) {
                    void change("PATCH", { action: "alt", altText: event.target.value, imageId: image.id });
                  }
                }}
              />
            </label> : null}
            {!readOnly ? <div className="mt-2 flex gap-2 text-sm">
              <button disabled={busy || index === 0} onClick={() => void change("PATCH", { action: "reorder", imageIds: moveImage(images, index, index - 1) })} type="button">Antes</button>
              <button disabled={busy || index === images.length - 1} onClick={() => void change("PATCH", { action: "reorder", imageIds: moveImage(images, index, index + 1) })} type="button">Después</button>
              <button disabled={busy} onClick={() => { if (confirm("¿Eliminar esta foto?")) void change("DELETE", undefined, `?imageId=${image.id}`); }} type="button">Eliminar</button>
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
