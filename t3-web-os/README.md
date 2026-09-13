# T³ Web OS

T³ is a Next.js 16 recreation and expansion of an AI operating-system interface. It includes a desktop shell, a generative Android-style phone shell, local persisted UI state, Prisma-backed runtime support, and AI-oriented UI workflows.

## Stack

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4 + shadcn/Radix UI
- Zustand + Framer Motion
- Prisma + SQLite
- Bun

## Getting started

1. Install dependencies:

   ```bash
   bun install
   ```

2. Create your local environment file:

   ```bash
   cp .env.example .env
   ```

3. Generate and initialize the Prisma database:

   ```bash
   bun run db:generate
   bun run db:push
   ```

4. Start development:

   ```bash
   bun run dev
   ```

Then open `http://localhost:3000`.

## Validation

```bash
bun run lint
bun run build
```

## Repository notes

Generated screenshots, temporary uploads, local databases, environment files, PID files, build output, logs, and dependency folders are intentionally excluded from version control. See `worklog.md` for the implementation history and project status.
