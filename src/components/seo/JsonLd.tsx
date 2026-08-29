type JsonLdProps = Readonly<{ data: Record<string, unknown> | ReadonlyArray<Record<string, unknown>> }>;

/** Renders supported structured data while escaping user-controlled Product text safely inside the script element. */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script dangerouslySetInnerHTML={{ __html: json }} type="application/ld+json" />;
}
