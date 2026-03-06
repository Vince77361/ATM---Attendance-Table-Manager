# Project Guidelines

## Stack

- Package Manager: npm (Node v22 LTS)
- Framework: Next.js (App Router)
- Language: TypeScript
- Database: PostgreSQL (Supabase)
- AI: OpenAI API (server-side only)
- Auth: Supabase OAuth (no custom JWT unless necessary)

---

## Architecture Principles

- NextJS Project rules: App router, TailwindCSS, src/ directory. Other settings - follow recommended one.
- Keep it simple.
- Avoid over-engineering.
- Prefer built-in Next.js features over custom abstractions.
- Do not introduce unnecessary layers (no service layer unless truly needed).
- Use API Route Handlers for backend logic.

---

## Environment Variables Rules

- Secrets must NEVER be exposed to the client.
- Only variables prefixed with `NEXT_PUBLIC_` may be used in client components.
- OpenAI API keys must be used only in server routes.
- Supabase service role key must remain server-side only.

---

## Code Style

- Prefer small, readable functions.
- Avoid deep folder nesting.
- Avoid premature optimization.
- Explicit naming over clever abstraction.
- If unsure, choose the simpler implementation.

---

## API Rules

- All AI calls must go through `/app/api/*` route handlers.
- Track user usage when calling AI endpoints.
- Return consistent JSON response format:

{
success: boolean,
data?: any,
error?: string
}

---

## Performance Philosophy

- Optimize only when necessary.
- Add caching only when repeated calls become a problem.
- Avoid adding Redis/queues unless traffic requires it.

---

## UI Philosophy

- Use radixui components when possible.
- If you use shadcn, make sure you use Node v22 (LTS)
- Use framer-motion and GSAP for interactive animation.
- Maintain consistent spacing and layout.
- Make Responsive Web for Desktop, Tablet, and Mobile.
- Avoid unnecessary animations.
- Focus on usability over visual complexity.

---

## Before Writing Complex Code

Always ask:

1. Can this be done simpler?
2. Is this abstraction actually needed?
3. Will this increase maintenance cost?

If yes → simplify.
