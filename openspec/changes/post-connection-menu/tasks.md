## 1. Add view state to Index.tsx

- [x] 1.1 Add `view` state (`"menu" | "templates"`) to `Index.tsx`, defaulting to `"menu"` when connected
- [x] 1.2 Update `loadTemplatesFromDevice` to no longer be called automatically on connection — remove it from `handleSSHConnect` and `handleQuickConnect`. Instead, set `connection` with an empty templates array and set `view` to `"menu"`
- [x] 1.3 Wire up `handleDisconnect` to also reset `view` to `"menu"`

## 2. Create ActionMenu component

- [x] 2.1 Create `frontend/src/components/ActionMenu.tsx` with three action cards: Backup, Restore, and Manage Templates. Accept callbacks `onBackup`, `onRestore`, and `onManageTemplates` as props
- [x] 2.2 Style the menu with motion animations consistent with the existing app design (use `framer-motion`, lucide icons, and the existing `Card`/`Button` components)

## 3. Integrate ActionMenu into Index.tsx

- [x] 3.1 Render `ActionMenu` in the connected view when `view === "menu"`, replacing the current direct template list rendering
- [x] 3.2 Implement `handleManageTemplates` — calls `loadTemplatesFromDevice` then sets `view` to `"templates"`
- [x] 3.3 When `view === "templates"`, render the existing device section + arrow + `TemplateList` layout (current connected view behavior)
- [x] 3.4 Move backup/restore progress overlay state and UI from `TemplateList` into `Index.tsx` or a shared overlay component so progress is visible from the menu context

## 4. Add back navigation from templates to menu

- [x] 4.1 Add a back button/link in the templates view that sets `view` back to `"menu"` without disconnecting

## 5. Remove backup/restore from TemplateList

- [x] 5.1 Remove the `onBackup` and `onRestore` props from `TemplateList` component
- [x] 5.2 Remove the Backup and Restore buttons from the action buttons section in `TemplateList`
- [x] 5.3 Remove backup and restore progress overlay state and UI (`backupState`, `backupProgress`, `currentBackupFile`, `restoreState`, `restoreProgress`, `currentRestoreFile` and their corresponding overlay JSX) from `TemplateList`

## 6. Testing and verification

- [x] 6.1 Verify the app builds without errors (`wails build` or `cd frontend && npm run build`)
- [x] 6.2 Run frontend lint (`cd frontend && npm run lint`) and fix any issues
- [x] 6.3 Run existing tests (`go test ./...` and `cd frontend && npm run test`) and fix any failures
