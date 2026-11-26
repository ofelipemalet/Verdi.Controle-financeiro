<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project architecture

- Finance domain logic (types, categories, money in integer cents, periods, calculations, zod schemas) lives in `src/features/finance/model` and stays free of React/UI imports — keeps calculations testable and reusable by a future backend.
- All persistence goes through the async `TransactionRepository` interface in `src/features/finance/data`; `data/index.ts` uses `cloud-repository.ts`, which calls authenticated `createServerFn` endpoints in `transactions.functions.ts` backed by Postgres RLS (`user_id = (select auth.uid())`) and `Cache-Control: private, no-store` — keeps validation, auth, and user isolation enforced server-side.
- Components read data only via the TanStack Query hooks in `src/features/finance/hooks`, keyed by `["transactions", userId]` from `AuthenticatedUserProvider` and invalidated after mutations — prevents cross-account cache leaks and keeps every page's indicators and charts in sync automatically.
- Public routes (`/`, `/auth`) live at top level with SSR; financial routes (`/inicio`, `/analises`, `/movimentacoes`) live under the `ssr: false` pathless layout `src/routes/_authenticated/route.tsx`, which gates access via `supabase.auth.getUser()` and owns `AppShell` and `TransactionDialogProvider`.
- Money is always stored and summed as integer cents and only divided by 100 when formatting — avoids floating-point rounding errors.
- Transaction create/edit/delete dialogs are owned by `TransactionDialogProvider` in `_authenticated/route.tsx` and opened through `useTransactionDialog()` — one form implementation for every authenticated page.
- Category icons/colors live in `features/finance/components/category-appearance.ts`, separate from category ids/labels in the model — keeps UI concerns out of the domain.
- `BrandMark` is the single source of the logo; the PNG/SVG app icons and `public/manifest.webmanifest` are rendered from the same mark — regenerate them whenever the mark changes so the installed app icon stays in sync.
- PWA shell caching uses `vite-plugin-pwa` (`generateSW`, `outDir: "dist/client"`, `injectRegister: null`, `devOptions: { enabled: false }`, `NetworkFirst` for HTML navigations excluding `/~oauth`, `/api/`, and `/_serverFn`, `CacheFirst` only for same-origin `/assets/`), registered exclusively via `src/lib/pwa-offline.ts` which blocks dev/iframe/preview hosts and `?sw=off` and unregisters matching `/sw.js` there.
