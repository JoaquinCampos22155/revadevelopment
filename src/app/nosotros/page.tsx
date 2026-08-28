import { permanentRedirect } from "next/navigation";

/** Preserves legacy links while keeping one canonical institutional public route. */
export default function AboutRedirectPage() { permanentRedirect("/como-funciona"); }
