## Context

Backup and restore operations in the app are asynchronous calls to the Go backend (`BackupTemplates`, `RestoreTemplates`) that can take significant time depending on the number of templates and network speed. Currently, the UI remains fully interactive during these operations — there is no loading state, spinner, or overlay. Users can click other buttons, trigger duplicate operations, or navigate away, leading to confusion.

The app already uses:
- `Loader2` spinner from lucide-react for template loading states
- `BaseAlertDialog` for success/error feedback after operations complete
- Framer Motion for animations
- shadcn/ui AlertDialog primitives for modal overlays

## Goals / Non-Goals

**Goals:**
- Block all user interaction during backup and restore operations
- Show a clear loading indicator with contextual message ("Backing up templates...", "Restoring templates...")
- Automatically dismiss when the operation completes (success or failure)
- Reuse existing UI patterns and components for consistency

**Non-Goals:**
- Real-time progress percentage (would require backend changes to stream progress)
- Cancel button for in-progress operations (backend operations are not cancellable)
- Changes to the Go backend

## Decisions

### 1. Use a non-dismissable AlertDialog overlay

**Choice**: Reuse the existing `AlertDialog` primitive from shadcn/ui to create a blocking overlay with a spinner and message.

**Rationale**: The app already uses `AlertDialog` for post-operation feedback (success/error). Using the same primitive for the loading state keeps the visual language consistent. Setting `closeOnOverlayClick={false}` and hiding the close button prevents the user from dismissing it.

**Alternatives considered**:
- Full-screen overlay div with z-index: simpler but loses dialog accessibility features and looks inconsistent with the rest of the app
- Inline loading state replacing the ActionMenu: doesn't fully block interaction with other parts of the UI

### 2. Manage loading state in Index.tsx via a single state variable

**Choice**: Add a `loadingOperation` state (`null | "backup" | "restore"`) in `Index.tsx` that controls the overlay visibility and message text.

**Rationale**: The backup/restore handlers are already in `Index.tsx`. A single state variable is sufficient since only one operation can run at a time. This avoids over-engineering with separate boolean states.

### 3. Create a dedicated LoadingOverlay component

**Choice**: Create a small `LoadingOverlay` component that wraps `AlertDialog` with a spinner and configurable message.

**Rationale**: Keeps `Index.tsx` clean and makes the loading overlay reusable for any future long-running operations. The component is simple — just an AlertDialog with a Loader2 spinner and a text prop.

## Risks / Trade-offs

- **[No progress feedback]** → Users see a spinner but not how far along the operation is. This is acceptable since adding progress would require backend streaming changes, and the operations typically complete within seconds to a minute.
- **[No cancel capability]** → If an operation hangs, the user must force-quit the app. This is a pre-existing limitation of the backend design and out of scope for this change.
