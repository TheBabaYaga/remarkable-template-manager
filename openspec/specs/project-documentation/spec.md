## ADDED Requirements

### Requirement: Documentation directory naming
The project SHALL use `docs/` as the documentation directory name. The former `documentation/` directory SHALL be renamed.

#### Scenario: Directory exists at correct path
- **WHEN** a user navigates to the project root
- **THEN** documentation files are located under `docs/`, not `documentation/`

### Requirement: Architecture documentation
The project SHALL include a `docs/architecture.md` file that covers backend module responsibilities, frontend component structure, and the data flow between frontend and backend.

#### Scenario: Architecture file covers backend
- **WHEN** a developer reads `docs/architecture.md`
- **THEN** it describes each Go source file's responsibility and the `App` struct as central coordinator

#### Scenario: Architecture file covers frontend
- **WHEN** a developer reads `docs/architecture.md`
- **THEN** it describes the page structure, component categories, and how Wails bindings connect frontend to backend

### Requirement: Device integration documentation
The project SHALL include a `docs/device-integration.md` file covering SSH connection details, reMarkable filesystem layout, template file format, and device-specific behaviors.

#### Scenario: Device doc covers SSH protocol
- **WHEN** a developer reads `docs/device-integration.md`
- **THEN** it describes SSH authentication method, default IP, user, port, and key management

#### Scenario: Device doc covers template format
- **WHEN** a developer reads `docs/device-integration.md`
- **THEN** it describes template file types, dimensions per device model, filename rules, and the `templates.json` structure

### Requirement: Configuration documentation accuracy
The `docs/configuration.md` file SHALL accurately reflect the current `Config` struct, including the `lastBackupDir` field and correct JSON example.

#### Scenario: Config doc includes lastBackupDir
- **WHEN** a developer reads `docs/configuration.md`
- **THEN** the JSON example includes the `lastBackupDir` field and the field descriptions document its purpose

### Requirement: README accuracy
The `README.md` SHALL accurately reflect the current codebase including all public API methods, all custom components, and the current backup system (local ZIP files).

#### Scenario: README lists all backend API methods
- **WHEN** a developer reads the Backend API section of `README.md`
- **THEN** all public methods on `App` that are exposed via Wails bindings are listed

#### Scenario: README backup references are current
- **WHEN** a developer reads backup-related sections of `README.md`
- **THEN** all references describe local ZIP backups and there are no references to on-device backup directories

#### Scenario: README project structure is current
- **WHEN** a developer reads the Project Structure section of `README.md`
- **THEN** it includes `config.go`, `ActionMenu.tsx`, `SetupChoiceDialog.tsx`, `SimplifiedSetupDialog.tsx`, `BackupSuccessDialog.tsx`, and `RestoreSuccessDialog.tsx`

### Requirement: CLAUDE.md references docs directory
`CLAUDE.md` SHALL reference the `docs/` directory so that AI agents and developers know where to find detailed documentation.

#### Scenario: CLAUDE.md points to docs
- **WHEN** an AI agent or developer reads `CLAUDE.md`
- **THEN** it includes a reference to the `docs/` directory for detailed architecture and device integration information
