## Context

After a successful SSH connection, the app immediately calls `FetchTemplates()` and renders the `TemplateList` component with backup/restore buttons at the bottom. This means:

1. Users who only want to backup or restore must wait for templates to load first
2. The backup/restore actions are visually subordinate (small buttons at the bottom of the template list)
3. There is no clear "what do you want to do?" moment after connecting

The current flow in `Index.tsx` uses a `connection` state (null = disconnected, object = connected) which directly drives the UI: disconnected shows the connect screen, connected shows device + arrow + template list.

## Goals / Non-Goals

**Goals:**
- Add an intermediate menu screen between connection and action
- Present Backup, Restore, and Manage Templates as equal first-class choices
- Defer template fetching until the user actually navigates to template management
- Keep backup/restore progress overlays and success dialogs working as they do today

**Non-Goals:**
- Redesigning the template management UI itself
- Changing the backup/restore logic or backend
- Adding new features (e.g., settings, device info screen)
- Changing the connection flow or setup dialogs

## Decisions

### 1. New view state in Index.tsx

**Decision**: Add a `view` state to `Index.tsx` with values `"menu" | "templates"`, active only when connected.

**Rationale**: The existing `connection` state handles connected vs disconnected. Adding a separate `view` state keeps concerns separated — `connection` tracks SSH state, `view` tracks which screen to show post-connection. This avoids overloading the connection object with UI navigation concerns.

**Alternatives considered**:
- *Nested route / React Router*: Overkill for two screens, adds a dependency, and Wails single-page apps typically avoid routing.
- *State inside connection object*: Muddies the connection data model with UI state.

### 2. New ActionMenu component

**Decision**: Create a new `ActionMenu.tsx` component that renders three cards/buttons — Backup, Restore, Manage Templates — in a visually balanced layout.

**Rationale**: Keeps `Index.tsx` as the orchestrator and the menu as a presentational component with callbacks, consistent with the existing pattern (e.g., `TemplateList` receives callbacks).

### 3. Move backup/restore triggers out of TemplateList

**Decision**: Remove the Backup and Restore buttons from `TemplateList.tsx`. The backup/restore flows will be triggered from the `ActionMenu` and handled by `Index.tsx` (which already owns `handleBackup` and `handleRestore`). The progress overlays for backup/restore should also move to `Index.tsx` since they no longer belong inside the template card.

**Rationale**: Backup and restore are device-level operations, not template-list operations. Moving them to the menu makes their scope clearer. The TemplateList becomes focused solely on template CRUD + sync.

**Alternatives considered**:
- *Keep backup/restore in both places*: Confusing duplication, breaks the "menu as entry point" mental model.

### 4. Template fetching deferred to "Manage Templates" selection

**Decision**: Only call `FetchTemplates()` when the user selects "Manage Templates" from the menu, not immediately on connection. The loading spinner currently shown in the connected view will appear when transitioning from menu to templates.

**Rationale**: Users going straight to backup/restore don't need templates loaded. This makes the connection feel faster and the backup/restore paths more direct.

### 5. Back navigation from templates to menu

**Decision**: Add a back button/link in the template view that returns to the action menu (sets `view` back to `"menu"`). This does NOT disconnect — the SSH session stays alive.

**Rationale**: Users may want to backup after managing templates, or vice versa. Forcing a disconnect-reconnect cycle would be poor UX.

## Risks / Trade-offs

- **Extra click for template-focused users**: Users who always go to templates now need one extra click. This is acceptable because the menu provides clarity and the click is fast.  
  Mitigation: None needed — the menu loads instantly with no network calls.

- **Backup/restore progress UI relocation**: Moving progress overlays out of TemplateList into Index.tsx increases Index.tsx complexity slightly.  
  Mitigation: The progress state already lives in TemplateList local state. It can be extracted into a simple progress overlay component reusable from Index.tsx, or managed inline since Index.tsx already handles the success dialogs.
