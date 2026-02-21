# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-02-21

### Added
- Simplified setup workflow for non-technical users
  - Quick setup requiring only device IP address and password
  - Automatically generates and uploads SSH key in the background
  - Single-step connection process with automatic configuration saving
  - Recommended setup option for users new to SSH
- Save and load connection configuration (SSH key, device IP, and connection preferences)
  - Automatically restore previous connection settings on app launch
  - Persist SSH key selection and device IP address
  - One-click reconnect to previously configured device
  - Options to connect to a different device or clear saved configuration
- Restore templates from a backup ZIP file
  - Select a backup file via native file picker
  - Current templates on device are renamed as a safety backup before restoring
  - Validates backup structure and `templates.json` before applying
  - Restore success dialog with reboot prompt
- Post-connection action menu with Backup, Restore, and Manage Templates options
- Blocking loading overlay during backup and restore operations
  - Non-dismissable overlay prevents interaction while operation is in progress
  - Shows spinner with contextual message ("Backing up templates..." / "Restoring templates...")
- Detailed documentation in `docs/` directory (architecture, device integration, configuration)
- [OpenSpec](https://github.com/Fission-AI/OpenSpec/) for structured development workflow

### Changed
- **BREAKING:** Backup system completely redesigned to store backups locally instead of on the reMarkable device
  - Backups now downloaded to user's computer and compressed as `.zip` archives
  - User selects backup location via native directory picker on each backup
  - Last used backup directory is remembered for convenience
  - Backup filename format: `remarkable-templates-backup-YYYYMMDD-HHMMSS.zip`
  - Backups survive reMarkable software updates and device resets
  - ZIP format provides cross-platform compatibility (Windows, macOS, Linux)
  - Compressed archives save disk space and are portable across systems
  - Backup success dialog shows file size, location, and filename
  - Users can store backups anywhere (cloud sync folders, external drives, etc.)
- Redesigned connection flow with intermediate setup choice screen (Simplified vs Advanced)
- Redesigned post-connection layout with side-by-side horizontal arrangement (device info on left, actions/templates on right)
- Unified pending changes display — unsynced templates and pending deletions shown together at the top of the template list
- Refactored dialog components into reusable UI primitives (base alert dialog, IP address input, password input)

### Fixed
- Shell command escaping for filenames with spaces and special characters
  - Backup and sync operations now properly handle template files with spaces in their names
  - All SSH file operations use proper shell escaping to prevent command injection

## [0.1.0] - 2026-01-27

Initial release of Remarkable Template Manager - a desktop application for managing templates on your reMarkable device.

### Added

#### Device Connection & Security
- SSH key authentication for secure device connections
- Select existing SSH keys from `~/.ssh` directory
- Generate new 4096-bit RSA SSH keys directly from the app
- Upload public keys using password authentication (one-time setup)
- Automatic read-write remount of the root filesystem after connecting
- Continuous connection health monitoring with auto-reconnect
  - Periodic connection checks every 10 seconds
  - Connection Lost dialog with retry/disconnect options
  - Automatic reconnection on connection recovery

#### Template Management
- Browse all templates currently installed on your device
- Upload new SVG or PNG templates via native file picker
- Rename templates before syncing (display name only)
- Queue templates for deletion and apply changes in one sync
- Prevent duplicate template names with validation
- Strict file and filename validation to avoid device issues
  - Only SVG and PNG files allowed
  - Filenames cannot contain spaces or special characters (only `-` and `_` allowed)
- Sync uploads and deletions safely in a single operation
- Connection validation before any sync operation

#### Backup & Safety
- One-click timestamped backups of all templates on the device
- Backups stored at `/usr/share/remarkable/templates_backup/backup_YYYYMMDD_HHMMSS/`
- Connection checks before any backup operation
- Optional device reboot prompt after syncing changes
- Safe file operations that don't physically delete files from device (only removes from `templates.json`)

#### User Interface
- Modern, responsive design built with Tailwind CSS and shadcn/ui
- Version display in top-right header (build-time configurable)
- Support link with QR code for donations
- Progress indicators during sync, backup, and upload operations
- Smooth animations using Framer Motion
- Real-time connection status indicator
- Template organization:
  - Unsynced templates shown at top with editable names
  - Synced templates from device shown below
  - Pending deletions shown separately with visual indicators
- Informative dialogs:
  - Connection method selection
  - SSH key selection and generation
  - Duplicate template warnings
  - Invalid filename errors
  - Sync success confirmation with reboot option
  - Connection lost notifications

#### Technical Features
- Cross-platform desktop application built with Wails (Go + React)
- Native file picker integration
- Secure SSH operations using golang.org/x/crypto/ssh
- Automatic Wails Go bindings generation
- Template metadata management via `templates.json`
- Comprehensive file and connection validation

[Unreleased]: https://github.com/TheBabaYaga/remarkable-template-manager/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/TheBabaYaga/remarkable-template-manager/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/TheBabaYaga/remarkable-template-manager/releases/tag/v0.1.0
