<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- WBS task state lives in `src/lib/wbs-store.ts` (browser localStorage, seeded from `wbs-seed.json` generated from the Hansen WBS template); pipeline progress must be derived from it, not from mock `progress` fields — single source of truth until a backend exists.
- Populated customer documents are prebuilt static files in `public/downloads/` — no server is needed to serve them.
