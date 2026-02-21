## Why

After connecting to the reMarkable device, the app immediately loads templates and shows the template management view with backup/restore buttons embedded in the template list. This forces users into template management even when they may only want to perform a backup or restore. An intermediate menu screen would provide a clearer entry point, letting users choose their intended action — backup, restore, or manage templates — before diving into a specific workflow.

## What Changes

- Add a new "post-connection menu" screen that appears after successful SSH connection, before any specific workflow begins
- The menu presents three clear choices: **Backup**, **Restore**, and **Manage Templates**
- Selecting **Manage Templates** navigates to the current template list view (existing behavior)
- Selecting **Backup** initiates the backup flow directly from the menu
- Selecting **Restore** initiates the restore flow directly from the menu
- Remove the backup and restore buttons from the TemplateList component since they now live in the menu
- Template fetching is deferred until the user selects "Manage Templates" (no need to load templates for backup/restore)

## Capabilities

### New Capabilities
- `post-connection-menu`: Intermediate navigation screen shown after device connection, presenting backup, restore, and template management as distinct workflow choices

### Modified Capabilities

## Impact

- **Frontend**: `Index.tsx` gains a new state/view between "connected" and "showing templates". New component for the menu screen. `TemplateList.tsx` loses its backup/restore buttons.
- **No backend changes**: All existing Go methods (backup, restore, template fetch) remain unchanged.
- **No breaking changes**: The same functionality is preserved, just reorganized into a clearer flow.
