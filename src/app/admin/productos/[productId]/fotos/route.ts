import { NextResponse } from "next/server";

import { createProductDraftReadService } from "@/features/product-manager/server/product-draft.composition";
import { createProductMediaActionService } from "@/features/product-manager/server/product-media.composition";
import { getCurrentUserProfile } from "@/features/users/server/current-user.service";

/** Uses JSON responses at this HTTP boundary rather than page-navigation redirects. */
async function getMediaMutationAuthorizationFailure(): Promise<NextResponse | null> {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return NextResponse.json({ error: "Inicia sesión para administrar fotos." }, { status: 401 });
  }

  if (profile.role !== "admin") {
    return NextResponse.json({ error: "No tienes permiso para administrar fotos." }, { status: 403 });
  }

  return null;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Ensures media remains immutable while a Product is publicly materialized. */
async function requireDraft(productId: string) {
  const product = await (await createProductDraftReadService()).findDraftById(productId);
  if (!product || product.status !== "draft") throw new Error("El producto no permite cambios de fotos.");
  return product;
}

/** Handles Product media binaries at a Node-only authenticated server boundary. */
export async function POST(request: Request, { params }: RouteContext<"/admin/productos/[productId]/fotos">) {
  try {
    const authorizationFailure = await getMediaMutationAuthorizationFailure();
    if (authorizationFailure) return authorizationFailure;
    const { productId } = await params;
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Selecciona una foto." }, { status: 400 });
    const draft = await requireDraft(productId);
    const image = await (await createProductMediaActionService()).upload(productId, draft.title, { bytes: new Uint8Array(await file.arrayBuffer()), declaredMimeType: file.type, size: file.size });
    return NextResponse.json({ image });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No fue posible procesar la foto." }, { status: 400 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext<"/admin/productos/[productId]/fotos">) {
  try {
    const authorizationFailure = await getMediaMutationAuthorizationFailure();
    if (authorizationFailure) return authorizationFailure;
    const { productId } = await params;
    await requireDraft(productId);
    const body = await request.json() as { action?: string; altText?: string; imageId?: string; imageIds?: string[] };
    const service = await createProductMediaActionService();
    if (body.action === "alt" && body.imageId && typeof body.altText === "string") await service.updateAltText(productId, body.imageId, body.altText);
    else if (body.action === "reorder" && Array.isArray(body.imageIds)) await service.reorder(productId, body.imageIds);
    else return NextResponse.json({ error: "Solicitud de fotos inválida." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No fue posible actualizar las fotos." }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext<"/admin/productos/[productId]/fotos">) {
  try {
    const authorizationFailure = await getMediaMutationAuthorizationFailure();
    if (authorizationFailure) return authorizationFailure;
    const { productId } = await params;
    await requireDraft(productId);
    const imageId = new URL(request.url).searchParams.get("imageId");
    if (!imageId) return NextResponse.json({ error: "Foto inválida." }, { status: 400 });
    await (await createProductMediaActionService()).remove(productId, imageId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No fue posible eliminar la foto." }, { status: 400 });
  }
}
