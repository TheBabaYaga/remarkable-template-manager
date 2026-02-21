# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Wails v2 desktop application for managing templates on reMarkable e-ink tablets. The app connects via SSH to upload, delete, and organize templates on the device.

## Build Commands

```bash
# Install frontend dependencies (required before first build)
cd frontend && npm install && cd ..

# Development mode with hot reload
wails dev

# Production build
wails build

# Build with version number
wails build -ldflags "-X main.Version=v1.0.0"

# Regenerate Wails bindings (after adding new Go methods)
wails generate module
```

## Testing

```bash
# Go tests
go test ./...

# Frontend tests
cd frontend && npm run test

# Frontend lint
cd frontend && npm run lint
```

## Architecture

### Backend (Go)

Single-package Go app with the `App` struct as the central coordinator:

- **main.go**: Wails app initialization, embeds frontend assets
- **app.go**: App struct with context, SSH client, and config state. Contains `startup()` lifecycle hook and config management methods
- **types.go**: Shared type definitions (`SSHKey`, `DeviceTemplate`, `SyncTemplate`, etc.)
- **ssh.go**: SSH connection management, key generation/listing, connection health monitoring
- **templates.go**: Template CRUD operations, sync to device, backup/restore
- **files.go**: Native file picker integration, SCP file uploads
- **device.go**: Device operations (reboot)
- **config.go**: Persistent configuration stored in user config directory

All public methods on `App` are automatically exposed to the frontend via Wails bindings.

### Frontend (React + TypeScript)

- **src/pages/Index.tsx**: Main page handling connection flow and template management state
- **src/components/**: Dialog components for connection methods, template operations, and error handling
- **src/components/ui/**: shadcn/ui component library
- **src/lib/template-utils.ts**: Template mapping and file utilities
- **frontend/wailsjs/**: Auto-generated Go bindings (do not edit manually)

### Key Data Flow

1. Frontend calls Go methods via generated bindings in `wailsjs/go/main/`
2. Go backend maintains SSH connection state in `App.sshClient`
3. Templates are read from/written to `/usr/share/remarkable/templates/templates.json` on device
4. Config persists device IP and SSH key path locally

## Device Integration

- Default device IP: `10.11.99.1`
- Templates stored at `/usr/share/remarkable/templates/` on device
- Template metadata in `templates.json` file
- Root filesystem auto-remounted read-write on connection
- Device reboot required for template changes to appear in UI
