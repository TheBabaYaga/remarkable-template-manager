## Context

The project currently has a `documentation/` directory containing only `configuration.md`. The `README.md` is comprehensive but has grown outdated as features evolved (local backups replaced on-device backups, new components and API methods were added). There is no standalone documentation for the backend/frontend architecture or device integration details — this information is partially scattered in `README.md` and `CLAUDE.md`.

## Goals / Non-Goals

**Goals:**
- Rename `documentation/` to `docs/` for convention
- Ensure all documentation accurately reflects the current codebase
- Add architecture documentation that describes how modules interact
- Add device integration documentation covering reMarkable-specific details
- Keep documentation concise — explain what's necessary, avoid restating code
- Update `README.md` to fix outdated sections and reference `docs/` for deeper topics

**Non-Goals:**
- Auto-generated API reference from code comments
- Inline code documentation (docstrings, JSDoc) — only docs/ files
- Documenting the OpenSpec workflow or `.claude/` internals
- Documenting shadcn/ui components (third-party library)

## Decisions

**1. Directory naming: `docs/` over `documentation/`**
- `docs/` is the de facto standard for project documentation directories
- Shorter, consistent with GitHub Pages convention and most open-source projects

**2. Documentation scope: 3 files in `docs/`**
- `configuration.md` — already exists, needs minor update
- `architecture.md` — new, covers backend modules, frontend structure, data flow
- `device-integration.md` — new, covers reMarkable SSH, filesystem, template format
- This avoids over-documentation while covering the topics not suited for `README.md`

**3. README stays as the primary entry point**
- Keep `README.md` as the main overview with links to `docs/` for details
- Fix inaccuracies rather than moving content out
- Add missing API methods and components to the existing sections

**4. CLAUDE.md gets a lightweight reference**
- Add a pointer to `docs/` for detailed architecture info
- Keep `CLAUDE.md` focused on build commands and quick orientation

## Risks / Trade-offs

- **[Stale docs]** → Documentation can drift from code over time. Mitigation: keep docs concise and high-level so they change less frequently. Detailed behavior lives in code.
- **[Rename breakage]** → Renaming `documentation/` to `docs/` could break links. Mitigation: search all files for references to `documentation/` and update them.
