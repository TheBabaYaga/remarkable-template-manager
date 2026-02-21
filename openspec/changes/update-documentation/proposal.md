## Why

The project documentation is incomplete and partially outdated. The `README.md` still references on-device backup paths despite backups now being local ZIP files, is missing several newer API methods and components, and the project structure listing is stale. The single `documentation/` directory only contains `configuration.md`. There is no documentation covering the backend/frontend architecture or reMarkable device integration specifics. The directory should also be renamed from `documentation/` to `docs/` for convention.

## What Changes

- Rename `documentation/` directory to `docs/`
- Update `docs/configuration.md` to include the `lastBackupDir` field and correct the JSON example
- Create `docs/architecture.md` covering backend module responsibilities, frontend component structure, and data flow
- Create `docs/device-integration.md` covering reMarkable SSH protocol, filesystem layout, and template format
- Update `README.md` to fix outdated backup references, add missing API methods (`RestoreTemplates`, `SelectBackupDirectory`, `SelectBackupFile`, `SaveLastBackupDirectory`, `GetLastBackupDirectory`), update project structure with newer components (`ActionMenu`, `SetupChoiceDialog`, `SimplifiedSetupDialog`, `BackupSuccessDialog`, `RestoreSuccessDialog`, `config.go`), and point to `docs/` for detailed documentation
- Update `CLAUDE.md` to reference `docs/` directory

## Capabilities

### New Capabilities

- `project-documentation`: Covers the structure, content, and accuracy requirements for the `docs/` directory and root documentation files

### Modified Capabilities

_(none — no existing specs)_

## Impact

- `documentation/` directory renamed to `docs/` (path change across any references)
- `README.md`, `CLAUDE.md` updated
- New files: `docs/architecture.md`, `docs/device-integration.md`
- Updated file: `docs/configuration.md`
- No code, API, or dependency changes
