# Architecture

## Overview

The application is a [Wails v2](https://wails.io/) desktop app with a Go backend and a React + TypeScript frontend. The Go backend handles SSH connections, file operations, and device communication. The frontend provides the UI and calls Go methods via auto-generated Wails bindings.

## Backend (Go)

All Go code lives in a single `main` package at the project root. The `App` struct is the central coordinator — it holds the SSH connection, application context, and configuration state. All public methods on `App` are automatically exposed to the frontend via Wails.

### Source Files

| File | Responsibility |
|------|---------------|
| `main.go` | Wails app initialization, embeds `frontend/dist` assets, sets window options |
| `app.go` | `App` struct definition, `startup()` lifecycle hook, version and config methods |
| `types.go` | Shared type definitions: `SSHKey`, `DeviceTemplate`, `SyncTemplate`, `BackupResult`, `RestoreResult`, `SelectedFile` |
| `config.go` | Persistent configuration: platform-specific paths, JSON read/write, file permissions (0600) |
| `ssh.go` | SSH connection management: key listing, generation, upload, connect/disconnect, health checks |
| `templates.go` | Template CRUD: fetch from device, sync (upload + delete), backup (download + ZIP), restore (extract + upload) |
| `files.go` | Native file pickers (template files, backup directory, backup files), SCP upload, ZIP compress/extract, directory upload/download |
| `device.go` | Device operations (reboot) |

### App Struct

```go
type App struct {
    ctx       context.Context  // Wails app context
    sshClient *ssh.Client      // Active SSH connection (nil when disconnected)
    config    *Config           // Loaded configuration state
}
```

On startup, `App.startup()` loads saved configuration from disk. The `sshClient` field is set when a connection is established and cleared on disconnect.

## Frontend (React + TypeScript)

The frontend lives in `frontend/src/` and uses Vite as the build tool.

### Pages

- **`pages/Index.tsx`** — Main page managing the full application flow: connection setup, action menu, template management. Handles all dialog state and connection health monitoring.
- **`pages/NotFound.tsx`** — 404 fallback.

### Component Categories

**Connection & Setup:**
- `SetupChoiceDialog` — SSH vs. simplified setup selection
- `SSHKeySelectionDialog` — Pick existing or generate new SSH key
- `SimplifiedSetupDialog` — Quick setup with IP + password
- `ConnectionMethodDialog` — Connection method selection
- `PasswordConnectionDialog` — Password entry for key upload
- `ConnectionLostDialog` — Connection loss with retry/disconnect

**Template Management:**
- `TemplateList` — Browse, upload, delete templates with sync controls
- `ActionMenu` — Post-connection actions (Backup, Restore, Manage Templates)
- `RemarkableDevice` — Device display with connection status

**Feedback Dialogs:**
- `ErrorDialog`, `InfoDialog` — Reusable base dialogs
- `DuplicateTemplateDialog`, `InvalidFilenameDialog` — Validation warnings
- `SyncSuccessDialog`, `BackupSuccessDialog`, `RestoreSuccessDialog` — Operation results
- `SupportDialog` — Support/donation link

**UI Library:**
- `components/ui/` — [shadcn/ui](https://ui.shadcn.com/) component library (65+ components)
- Includes custom components: `ip-address-input.tsx`, `password-input.tsx`

### Hooks & Utilities

- `hooks/use-mobile.tsx` — Mobile device detection
- `hooks/use-toast.ts` — Toast notification management
- `lib/utils.ts` — Tailwind CSS class utilities
- `lib/template-utils.ts` — Template mapping between device and UI formats

### Auto-Generated Bindings

`frontend/wailsjs/` contains Wails-generated TypeScript bindings for all public Go methods. **Do not edit these files manually** — they are regenerated with `wails generate module`.

## Data Flow

```
Frontend (React)                    Backend (Go)                    Device (reMarkable)
─────────────────                   ─────────────────               ───────────────────
                    Wails bindings
UI actions ──────────────────────►  App methods
                                    │
                                    ├─► SSH operations ──────────►  /usr/share/remarkable/templates/
                                    │   (via sshClient)             templates.json
                                    │
                                    ├─► Config persistence
                                    │   (platform-specific JSON)
                                    │
                                    └─► Native dialogs
                                        (file/directory pickers)
```

1. **Frontend → Backend**: UI calls Go methods through generated bindings in `wailsjs/go/main/App`.
2. **Backend → Device**: Go maintains an SSH connection in `App.sshClient`. All device operations (template fetch, sync, backup, restore, reboot) run SSH commands or transfer files over this connection.
3. **Backend → Local Disk**: Configuration is persisted to a platform-specific JSON file. Backups are downloaded from the device and saved as local ZIP files.
4. **Connection Monitoring**: The frontend polls `CheckConnection()` every 10 seconds. If the connection drops, a dialog prompts the user to retry or disconnect.
