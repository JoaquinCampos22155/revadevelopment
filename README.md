# REVA

REVA is a Guatemalan circular fashion discovery platform. The current MVP is a static editorial frontend focused on trust, product discovery, and purchase intent before Backend Foundation.

## Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- pnpm
- Embla Carousel for the Home featured-collections carousel

## Development

```bash
pnpm install
pnpm dev
```

## Quality checks

```bash
pnpm lint
pnpm build
```

## Project conventions

- Use `pnpm` for all package commands.
- Public routes live in `src/app`.
- Shared UI belongs in `src/components`; feature-specific UI belongs in `src/features`.
- Editorial content lives in `src/content` until it is replaced by a future data source.
- Do not connect UI components directly to a database or storage provider.
- The `/playground` route is an internal, non-indexed UI laboratory.
