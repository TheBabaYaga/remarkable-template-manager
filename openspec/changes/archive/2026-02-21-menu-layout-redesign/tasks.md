## 1. Update menu view layout in Index.tsx

- [x] 1.1 Change the menu view `<main>` from `flex flex-col items-center justify-center gap-8` to `flex items-center justify-center gap-8` (matching the templates view)
- [x] 1.2 Add the `ArrowRight` separator between the device section and the `ActionMenu` component, identical to the one used in the templates view

## 2. Update ActionMenu component to grid layout

- [x] 2.1 Change the ActionMenu card container from `flex flex-col gap-3` to a 2-column CSS grid (`grid grid-cols-2 gap-3`)
- [x] 2.2 Make the Manage Templates card span the full grid width (`col-span-2`) while Backup and Restore each take one column
- [x] 2.3 Adjust card content layout for the narrower grid cells (ensure icon, label, and description still fit cleanly)

## 3. Testing and verification

- [x] 3.1 Verify the app builds without errors (`cd frontend && npm run build`)
- [x] 3.2 Run frontend lint on changed files and fix any issues
- [x] 3.3 Run existing tests (`go test ./...` and `cd frontend && npm run test`) and fix any failures
