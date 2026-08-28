import Image from "next/image";
import Link from "next/link";

import type { CatalogProductPreview } from "@/types/catalog";

type ExplorationProps = Readonly<{ product: CatalogProductPreview | null }>;

function PlaygroundNav({ tone }: Readonly<{ tone: "light" | "dark" | "warm" }>) {
  const colors = tone === "dark" ? "text-stone-100" : tone === "warm" ? "text-[#54281f]" : "text-slate-950";
  const rule = tone === "dark" ? "border-white/25" : tone === "warm" ? "border-[#8e4d3a]/30" : "border-slate-950/25";

  return <header className={`mx-auto flex max-w-7xl items-center justify-between gap-3 border-b ${rule} px-4 py-4 sm:px-8 sm:py-5`}>
    <Link aria-label="REVA Playground" className={`font-serif text-xl tracking-[0.24em] ${colors}`} href="/playground">REVA</Link>
    <nav aria-label="Navegación experimental" className={`flex gap-3 text-xs font-medium sm:gap-6 sm:text-sm ${colors}`}>
      <Link href="/">Inicio</Link><Link href="/catalogo">Catálogo</Link><Link href="/vender">Vender</Link>
    </nav>
    <Link aria-label="Iniciar sesión" className={`min-h-10 shrink-0 rounded-full border ${rule} px-3 py-2 text-xs font-medium sm:min-h-11 sm:px-4 sm:py-3 sm:text-sm ${colors}`} href="/iniciar-sesion">Ingresar</Link>
  </header>;
}

function ProductImage({ product, className }: Readonly<{ product: CatalogProductPreview | null; className: string }>) {
  if (!product) return <div className={`${className} grid place-items-center bg-black/10 p-7 text-sm`}>La composición se adapta cuando no hay productos publicados.</div>;
  const image = product.image;

  return "width" in image
    ? <Image alt={image.alt} className={className} height={image.height} src={image.src} width={image.width} />
    : <Image alt={image.alt} className={className} src={image.src} />;
}

function ProductInformation({ product, tone = "light" }: Readonly<{ product: CatalogProductPreview | null; tone?: "light" | "dark" }>) {
  if (!product) return null;
  const text = tone === "dark" ? "text-stone-50" : "text-slate-950";
  const quiet = tone === "dark" ? "text-stone-300" : "text-slate-600";
  return <Link className={`block ${text}`} href={product.href}>
    <p className={`text-xs font-medium uppercase tracking-[0.14em] ${quiet}`}>{product.category} · {product.condition}</p>
    <h3 className="mt-2 font-serif text-2xl leading-tight">{product.name}</h3>
    <p className="mt-2 text-sm font-medium">{product.price}</p>
  </Link>;
}

function RecommendationNote() { return <p className="text-xs leading-5 opacity-70">Exploración interna con producto real; no modifica la selección pública.</p>; }

export function WarmEditorialExploration({ product }: ExplorationProps) {
  return <main className="min-h-screen bg-[#f5eee3] text-[#54281f]"><PlaygroundNav tone="warm" />
    <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end lg:pt-20"><div className="max-w-xl space-y-7 lg:pb-12"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a64d36]">Moda circular en Guatemala</p><h1 className="font-serif text-5xl leading-[0.9] tracking-tight sm:text-7xl">Prendas que vuelven a contar una historia.</h1><p className="max-w-md text-base leading-7 text-[#704238]">Descubre piezas seleccionadas para seguir circulando, sin complicar la experiencia.</p><div className="flex flex-wrap gap-3"><Link className="rounded-full bg-[#8f3f31] px-5 py-3 text-sm font-semibold text-white" href="/catalogo">Explorar prendas</Link><Link className="rounded-full border border-[#8f3f31]/40 px-5 py-3 text-sm font-semibold" href="/vender">Quiero vender</Link></div></div><div className="relative mx-auto w-full max-w-md lg:max-w-none"><div className="absolute -left-7 top-10 h-44 w-44 rounded-full bg-[#d99a61]/45" /><ProductImage className="relative aspect-[4/5] w-full rounded-[48%_48%_18%_18%] object-cover shadow-[18px_20px_0_#d5b696]" product={product} /></div></section>
    <section className="border-y border-[#8e4d3a]/20 bg-[#e7cda9] py-10"><div className="mx-auto grid max-w-7xl gap-7 px-5 sm:px-8 lg:grid-cols-[0.55fr_1fr] lg:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em]">Recomendado por REVA</p><h2 className="mt-3 max-w-xs font-serif text-3xl leading-tight">Una pieza para empezar.</h2></div><div className="grid gap-5 sm:grid-cols-[0.65fr_1fr] sm:items-end"><ProductImage className="aspect-[5/4] w-full rounded-[34%_12%_34%_12%] object-cover" product={product} /><div><ProductInformation product={product} /><div className="mt-4"><RecommendationNote /></div></div></div></div></section>
    <section className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-14 sm:px-8 sm:py-20"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a64d36]">¿Tienes una prenda para ofrecer?</p><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><h2 className="max-w-xl font-serif text-4xl leading-tight">El siguiente ciclo puede empezar contigo.</h2><Link className="text-sm font-semibold underline underline-offset-8" href="/vender">Conoce cómo funciona</Link></div></section>
  </main>;
}

export function FashionEditorialExploration({ product }: ExplorationProps) {
  return <main className="min-h-screen bg-[#151515] text-stone-100"><PlaygroundNav tone="dark" />
    <section className="mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 lg:pt-24"><div className="grid gap-9 lg:grid-cols-[1.25fr_0.75fr]"><div className="flex min-h-[30rem] flex-col justify-between"><p className="max-w-sm text-xs font-semibold uppercase tracking-[0.2em] text-[#e2a4a0]">Moda circular / Guatemala</p><h1 className="max-w-4xl font-serif text-6xl leading-[0.82] tracking-[-0.04em] sm:text-8xl">Vestir distinto.<br /><span className="text-[#e44d42]">Circular</span> mejor.</h1><div className="flex flex-wrap gap-4"><Link className="border-b border-white pb-2 text-sm font-semibold" href="/catalogo">Explorar prendas</Link><Link className="border-b border-[#e44d42] pb-2 text-sm font-semibold text-[#ff938b]" href="/vender">Quiero vender</Link></div></div><div className="relative"><ProductImage className="aspect-[3/4] w-full object-cover" product={product} /><p className="absolute -bottom-5 -left-3 bg-[#e44d42] px-5 py-4 font-serif text-2xl text-white">REVA / 01</p></div></div></section>
    <section className="border-t border-white/20 py-11"><div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.7fr_1.3fr]"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e2a4a0]">Recomendado por REVA</p><h2 className="mt-3 max-w-xs font-serif text-3xl leading-tight">La selección no necesita ocupar toda la página.</h2></div><div className="grid gap-5 sm:grid-cols-[0.7fr_1fr] sm:items-end"><ProductImage className="aspect-square w-full object-cover" product={product} /><div><ProductInformation product={product} tone="dark" /><div className="mt-5"><RecommendationNote /></div></div></div></div></section>
    <section className="bg-[#e44d42] px-5 py-14 text-[#151515] sm:px-8 sm:py-20"><div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><h2 className="max-w-2xl font-serif text-5xl leading-[0.9]">¿Una prenda lista para otra historia?</h2><Link className="text-sm font-bold underline underline-offset-8" href="/vender">Conoce cómo funciona</Link></div></section>
  </main>;
}

export function ContemporaryPlayfulExploration({ product }: ExplorationProps) {
  return <main className="min-h-screen bg-[#2255c9] text-[#fff9eb]"><PlaygroundNav tone="dark" />
    <section className="relative overflow-hidden"><div className="absolute right-[-7rem] top-8 h-72 w-72 rounded-full bg-[#f4b645]" /><div className="absolute bottom-8 left-[-3rem] h-36 w-36 rounded-[35%] bg-[#f16c55]" /><div className="relative mx-auto grid max-w-7xl gap-9 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:py-20"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f4d59b]">Circular, pero nunca aburrido</p><h1 className="mt-6 font-serif text-6xl leading-[0.83] tracking-tight sm:text-8xl">Tu próximo hallazgo está aquí.</h1><p className="mt-6 max-w-md text-base leading-7 text-blue-100">Piezas reales, selección clara y una forma más viva de descubrir moda de segunda mano.</p><div className="mt-8 flex flex-wrap gap-3"><Link className="rounded-full bg-[#fff9eb] px-5 py-3 text-sm font-bold text-[#2255c9]" href="/catalogo">Explorar prendas</Link><Link className="rounded-full border border-[#fff9eb]/60 px-5 py-3 text-sm font-bold" href="/vender">Quiero vender</Link></div></div><div className="relative mx-auto w-full max-w-sm"><ProductImage className="aspect-[4/5] w-full rounded-[50%_50%_10%_50%] object-cover ring-[10px] ring-[#f4b645]" product={product} /><span className="absolute -right-4 bottom-9 rotate-[-8deg] rounded-full bg-[#f16c55] px-5 py-3 text-sm font-bold text-[#fff9eb]">REVA recomienda</span></div></div></section>
    <section className="bg-[#fff9eb] py-11 text-[#172d76]"><div className="mx-auto grid max-w-7xl gap-7 px-5 sm:px-8 lg:grid-cols-[0.55fr_1fr] lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d95340]">Recomendado por REVA</p><h2 className="mt-3 font-serif text-4xl leading-tight">Menos interfaz. Más prenda.</h2></div><div className="grid gap-5 sm:grid-cols-[0.75fr_1fr] sm:items-end"><ProductImage className="aspect-[5/4] w-full rounded-[24px_70px_24px_70px] object-cover" product={product} /><div><ProductInformation product={product} /><div className="mt-4"><RecommendationNote /></div></div></div></div></section>
    <section className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-14 sm:px-8 sm:py-20"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d59b]">¿Tienes una prenda para ofrecer?</p><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><h2 className="max-w-2xl font-serif text-5xl leading-[0.9]">Hagamos que siga circulando.</h2><Link className="rounded-full bg-[#f4b645] px-5 py-3 text-sm font-bold text-[#172d76]" href="/vender">Conoce cómo funciona</Link></div></section>
  </main>;
}
