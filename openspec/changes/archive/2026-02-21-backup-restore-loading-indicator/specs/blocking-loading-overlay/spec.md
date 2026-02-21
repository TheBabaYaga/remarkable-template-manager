## ADDED Requirements

### Requirement: Loading overlay blocks interaction during backup
The system SHALL display a non-dismissable loading overlay when a backup operation is in progress. The overlay MUST prevent all user interaction with the application until the operation completes.

#### Scenario: Backup operation starts
- **WHEN** the user selects a backup directory and the backup operation begins
- **THEN** a blocking overlay appears with a spinner and the message "Backing up templates..."

#### Scenario: Backup operation succeeds
- **WHEN** the backup operation completes successfully
- **THEN** the loading overlay is dismissed and the backup success dialog is shown

#### Scenario: Backup operation fails
- **WHEN** the backup operation fails with an error
- **THEN** the loading overlay is dismissed and the error is handled by the existing error flow

### Requirement: Loading overlay blocks interaction during restore
The system SHALL display a non-dismissable loading overlay when a restore operation is in progress. The overlay MUST prevent all user interaction with the application until the operation completes.

#### Scenario: Restore operation starts
- **WHEN** the user selects a backup file and the restore operation begins
- **THEN** a blocking overlay appears with a spinner and the message "Restoring templates..."

#### Scenario: Restore operation succeeds
- **WHEN** the restore operation completes successfully
- **THEN** the loading overlay is dismissed and the restore success dialog is shown

#### Scenario: Restore operation fails
- **WHEN** the restore operation fails with an error
- **THEN** the loading overlay is dismissed and the error is handled by the existing error flow

### Requirement: Loading overlay cannot be dismissed by the user
The loading overlay MUST NOT be dismissable via clicking outside, pressing Escape, or any other user action. It SHALL only be dismissed programmatically when the operation completes.

#### Scenario: User attempts to dismiss overlay
- **WHEN** the user clicks outside the overlay or presses Escape during a backup or restore operation
- **THEN** the overlay remains visible and the operation continues uninterrupted
