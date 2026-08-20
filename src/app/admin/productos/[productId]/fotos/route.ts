import { NextResponse } from "next/server";
import { createProductDraftReadService } from "@/features/product-manager/server/product-draft.composition";
import { requireCurrentAdmin } from "@/features/product-manager/server/admin-access";
import { createProductMediaService } from "@/features/product-manager/server/product-media.composition";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Handles Product media binaries at a Node-only authenticated server boundary. */
export async function POST(request: Request, { params }: RouteContext<"/admin/productos/[productId]/fotos">) {
  try {
    await requireCurrentAdmin(); const { productId } = await params;
    const formData = await request.formData(); const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({error:"Selecciona una foto."},{status:400});
    const draft = await (await createProductDraftReadService()).findDraftById(productId);
    if (!draft) return NextResponse.json({error:"El borrador no existe."},{status:404});
    const image = await (await createProductMediaService()).upload(productId,draft.title,{bytes:new Uint8Array(await file.arrayBuffer()),declaredMimeType:file.type,size:file.size});
    return NextResponse.json({image});
  } catch (error) { return NextResponse.json({error:error instanceof Error?error.message:"No fue posible procesar la foto."},{status:400}); }
}
export async function PATCH(request: Request, { params }: RouteContext<"/admin/productos/[productId]/fotos">) { try { await requireCurrentAdmin(); const {productId}=await params; const body=await request.json() as {action?:string;altText?:string;imageId?:string;imageIds?:string[]}; const service=await createProductMediaService(); if(body.action==="alt"&&body.imageId&&typeof body.altText==="string") await service.updateAltText(productId,body.imageId,body.altText); else if(body.action==="reorder"&&Array.isArray(body.imageIds)) await service.reorder(productId,body.imageIds); else return NextResponse.json({error:"Solicitud de fotos inválida."},{status:400}); return NextResponse.json({ok:true}); } catch(error){return NextResponse.json({error:error instanceof Error?error.message:"No fue posible actualizar las fotos."},{status:400});} }
export async function DELETE(request: Request, { params }: RouteContext<"/admin/productos/[productId]/fotos">) { try { await requireCurrentAdmin(); const {productId}=await params; const imageId=new URL(request.url).searchParams.get("imageId"); if(!imageId)return NextResponse.json({error:"Foto inválida."},{status:400}); await (await createProductMediaService()).remove(productId,imageId); return NextResponse.json({ok:true}); } catch(error){return NextResponse.json({error:error instanceof Error?error.message:"No fue posible eliminar la foto."},{status:400});} }
