## 1. Rename documentation directory

- [x] 1.1 Rename `documentation/` to `docs/` using `git mv`
- [x] 1.2 Search all files for references to `documentation/` and update to `docs/`

## 2. Update configuration.md

- [x] 2.1 Add `lastBackupDir` field to the JSON example and field descriptions
- [x] 2.2 Update the Config struct code block to include `LastBackupDir`
- [x] 2.3 Remove or update any references that no longer match the current code

## 3. Create architecture.md

- [x] 3.1 Create `docs/architecture.md` with backend section covering each Go file's responsibility and the `App` struct as coordinator
- [x] 3.2 Add frontend section covering page structure, component categories (connection, template management, dialogs, UI library), and hooks/utilities
- [x] 3.3 Add data flow section describing Wails bindings, SSH state management, and config persistence

## 4. Create device-integration.md

- [x] 4.1 Create `docs/device-integration.md` with SSH connection details (auth method, default IP `10.11.99.1`, root user, port 22, key generation)
- [x] 4.2 Add filesystem layout section (`/usr/share/remarkable/templates/`, `templates.json` structure, read-write remount)
- [x] 4.3 Add template format section (PNG/SVG, dimensions per device model, filename rules, `templates.json` entry structure)

## 5. Update README.md

- [x] 5.1 Fix backup workflow and storage location sections to reflect local ZIP backups (remove on-device backup path references)
- [x] 5.2 Add missing API methods to Backend API section: `RestoreTemplates`, `SelectBackupDirectory`, `SelectBackupFile`, `SaveLastBackupDirectory`, `GetLastBackupDirectory`, `LoadConfig`, `SaveConfig`, `DeleteConfig`, `GetConfigPath`, `SaveLastBackupDirectory`, `GetLastBackupDirectory`
- [x] 5.3 Update project structure tree to include `config.go`, `ActionMenu.tsx`, `SetupChoiceDialog.tsx`, `SimplifiedSetupDialog.tsx`, `BackupSuccessDialog.tsx`, `RestoreSuccessDialog.tsx`
- [x] 5.4 Add links to `docs/` files for detailed architecture and device integration information

## 6. Update CLAUDE.md

- [x] 6.1 Add reference to `docs/` directory for detailed documentation (architecture, device integration, configuration)
