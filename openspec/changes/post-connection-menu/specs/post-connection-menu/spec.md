## ADDED Requirements

### Requirement: Action menu displayed after connection
The system SHALL display an action menu screen immediately after a successful SSH connection to the reMarkable device, before any other workflow begins.

#### Scenario: Successful connection shows menu
- **WHEN** the user successfully connects to the reMarkable device via SSH
- **THEN** the system displays the action menu with three options: Backup, Restore, and Manage Templates
- **AND** the system does NOT automatically fetch templates from the device

#### Scenario: Quick connect shows menu
- **WHEN** the user connects via the quick connect button using saved config
- **THEN** the system displays the action menu (same as a fresh connection)

### Requirement: Backup action from menu
The system SHALL allow the user to initiate a full device template backup directly from the action menu.

#### Scenario: User selects Backup
- **WHEN** the user selects "Backup" from the action menu
- **THEN** the system prompts the user to select a backup directory
- **AND** performs the backup with progress feedback
- **AND** displays the backup success dialog upon completion

#### Scenario: User cancels backup directory selection
- **WHEN** the user selects "Backup" from the action menu
- **AND** cancels the directory selection dialog
- **THEN** the system returns to the action menu

### Requirement: Restore action from menu
The system SHALL allow the user to restore templates from a backup file directly from the action menu.

#### Scenario: User selects Restore
- **WHEN** the user selects "Restore" from the action menu
- **THEN** the system prompts the user to select a backup file
- **AND** performs the restore with progress feedback
- **AND** displays the restore success dialog upon completion

#### Scenario: User cancels restore file selection
- **WHEN** the user selects "Restore" from the action menu
- **AND** cancels the file selection dialog
- **THEN** the system returns to the action menu

### Requirement: Manage Templates action from menu
The system SHALL allow the user to navigate to the template management view from the action menu.

#### Scenario: User selects Manage Templates
- **WHEN** the user selects "Manage Templates" from the action menu
- **THEN** the system fetches templates from the device
- **AND** displays the template list view with add, delete, and sync capabilities

#### Scenario: Template fetch fails
- **WHEN** the user selects "Manage Templates" from the action menu
- **AND** template fetching fails
- **THEN** the system displays the template list with an empty template set

### Requirement: Back navigation from template view to menu
The system SHALL provide a way to navigate back from the template management view to the action menu without disconnecting.

#### Scenario: User navigates back to menu
- **WHEN** the user is in the template management view
- **AND** selects the back navigation control
- **THEN** the system displays the action menu
- **AND** the SSH connection remains active

### Requirement: Backup and restore buttons removed from template list
The template list view SHALL NOT contain backup or restore buttons. These actions are exclusively accessible from the action menu.

#### Scenario: Template list shows only template actions
- **WHEN** the user is in the template management view
- **THEN** the template list displays add, delete, and sync controls
- **AND** does NOT display backup or restore buttons
