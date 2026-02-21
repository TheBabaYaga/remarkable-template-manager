## Why

When a user triggers a backup or restore operation, there is no visual feedback indicating the operation is in progress. The user can continue interacting with the app during these potentially lengthy operations, which could lead to confusion, duplicate actions, or unexpected behavior. A blocking loading indicator is needed to communicate progress and prevent interaction until the operation completes.

## What Changes

- Add a blocking overlay/modal with a loading indicator that appears during backup and restore operations
- Prevent user interaction with the rest of the app while backup/restore is in progress
- Show contextual messaging (e.g., "Backing up templates..." or "Restoring templates...") so the user knows what's happening
- Dismiss the loading indicator automatically when the operation succeeds or fails

## Capabilities

### New Capabilities
- `blocking-loading-overlay`: A full-screen blocking overlay component with a spinner and status message, displayed during long-running operations like backup and restore

### Modified Capabilities
None

## Impact

- **Frontend components**: `Index.tsx` (backup/restore handlers need to manage loading state), new overlay component
- **No backend changes**: The existing `BackupTemplates` and `RestoreTemplates` Go methods remain unchanged
- **UX**: Users will no longer be able to interact with the app during backup/restore, preventing accidental duplicate operations
