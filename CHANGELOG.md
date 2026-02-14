# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Simplified setup workflow for non-technical users
  - Quick setup requiring only device IP address and password
  - Automatically generates and uploads SSH key in the background
  - Single-step connection process with automatic configuration saving
  - Recommended setup option for users new to SSH
- Save and load connection configuration (SSH key, device IP, and connection preferences)
  - Automatically restore previous connection settings on app launch
  - Persist SSH key selection and device IP address
  - Streamlined reconnection workflow for returning users

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

[Unreleased]: https://github.com/TheBabaYaga/remarkable-template-manager/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/TheBabaYaga/remarkable-template-manager/releases/tag/v0.1.0
