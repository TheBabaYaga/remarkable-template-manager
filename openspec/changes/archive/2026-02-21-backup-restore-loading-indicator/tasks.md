## 1. Loading Overlay Component

- [x] 1.1 Create `LoadingOverlay` component at `frontend/src/components/LoadingOverlay.tsx` using `AlertDialog` with `Loader2` spinner, a configurable message prop, and `closeOnOverlayClick={false}` to prevent dismissal
- [x] 1.2 Ensure the overlay cannot be dismissed via Escape key or overlay click

## 2. Integrate with Backup Flow

- [x] 2.1 Add `loadingOperation` state (`null | "backup" | "restore"`) to `Index.tsx`
- [x] 2.2 Set `loadingOperation` to `"backup"` before calling `BackupTemplates` in `handleBackup` and clear it on success or failure
- [x] 2.3 Render `LoadingOverlay` in `Index.tsx` when `loadingOperation` is `"backup"` with message "Backing up templates..."

## 3. Integrate with Restore Flow

- [x] 3.1 Set `loadingOperation` to `"restore"` before calling `RestoreTemplates` in `handleRestore` and clear it on success or failure
- [x] 3.2 Render `LoadingOverlay` when `loadingOperation` is `"restore"` with message "Restoring templates..."

## 4. Verify

- [x] 4.1 Test that the overlay appears during backup, blocks interaction, and dismisses on completion
- [x] 4.2 Test that the overlay appears during restore, blocks interaction, and dismisses on completion
- [x] 4.3 Test that the overlay cannot be dismissed by clicking outside or pressing Escape
