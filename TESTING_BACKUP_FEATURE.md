# Backup Feature Testing Guide

## Overview
The backup feature has been completely reimplemented to store backups locally as compressed tar.gz archives instead of on the reMarkable device itself.

## What Changed

### Backend (Go)
1. **New Methods Added:**
   - `SelectBackupDirectory()` - Opens native directory picker dialog
   - `BackupTemplates(targetDir string)` - Downloads and compresses templates
   - `SaveLastBackupDirectory(dir string)` - Saves last used directory
   - `GetLastBackupDirectory()` - Retrieves last used directory
   - `downloadDirectoryRecursive()` - Recursively downloads directory from device
   - `downloadFile()` - Downloads single file from device
   - `compressDirectory()` - Creates ZIP archive

2. **Types Added:**
   - `BackupResult` struct with `FilePath` and `SizeBytes` fields

3. **Config Updated:**
   - Added optional `LastBackupDir` field to remember last backup location

### Frontend (TypeScript/React)
1. **New Component:**
   - `BackupSuccessDialog` - Shows backup completion with file info and "Open Location" button

2. **Updated Flow:**
   - Backup button now triggers directory selection dialog
   - After selection, downloads templates from device
   - Compresses to ZIP format
   - Saves to user-selected location
   - Shows success dialog with file path and size

## Testing Checklist

### 1. Directory Selection
- [ ] Click backup button in the connected device view
- [ ] Verify native directory picker opens
- [ ] Select a directory and verify backup proceeds
- [ ] Click cancel on directory picker and verify backup is aborted (no error shown)

### 2. Backup Creation
- [ ] Verify backup file is created with format: `remarkable-templates-backup-YYYYMMDD-HHMMSS.zip`
- [ ] Check backup file exists in the selected location
- [ ] Verify file size is reasonable (should be compressed)

### 3. Backup Contents
- [ ] Extract the ZIP file (double-click on Windows/macOS or use unzip tool)
- [ ] Verify it contains a `templates` directory
- [ ] Verify `templates.json` is present
- [ ] Verify all template files (.svg/.png) are present
- [ ] Check file integrity by comparing with device files

### 4. Success Dialog
- [ ] Verify success dialog appears after backup completes
- [ ] Check that file name, size, and path are displayed correctly
- [ ] Click "Open Location" button and verify it opens the backup directory in Finder/Explorer
- [ ] Click "Close" button and verify dialog dismisses

### 5. Error Handling
- [ ] Test backup when not connected to device (should show error)
- [ ] Test backup to read-only location (should show error)
- [ ] Test backup when disk is full (should show error)
- [ ] Test backup when SSH connection drops mid-download (should show error)

### 6. Config Persistence
- [ ] Perform a backup to directory A
- [ ] Close and reopen the app
- [ ] Perform another backup
- [ ] Verify the directory picker opens to the last used location (directory A)

### 7. Cross-Platform Testing
- [ ] Test on macOS
- [ ] Test on Windows
- [ ] Test on Linux
- [ ] Verify directory picker works correctly on each platform
- [ ] Verify file path separators are handled correctly

### 8. Large Template Collections
- [ ] Test with a device that has many templates (50+)
- [ ] Verify download completes without timeout
- [ ] Verify compression completes successfully
- [ ] Check that progress doesn't appear frozen to the user

## Expected Behavior

### Happy Path
1. User clicks "Backup" button while connected
2. Native directory picker opens
3. User selects a directory
4. App shows loading state
5. App downloads all templates from device via SSH
6. App compresses templates to ZIP format
7. Success dialog shows with:
   - File name: `remarkable-templates-backup-YYYYMMDD-HHMMSS.zip`
   - File size: formatted (e.g., "2.5 MB")
   - Full path to backup file
8. User clicks "Close" to dismiss the dialog
9. Last used directory is saved for next backup

### Cancellation
1. User clicks "Backup" button
2. Directory picker opens
3. User clicks "Cancel"
4. No backup is created, no error shown
5. App returns to normal state

### Error Cases
- Connection errors: Shows error message from TemplateList component
- Disk space errors: Shows error with message about insufficient space
- Permission errors: Shows error with message about write permissions

## Build and Run

The application has been successfully built. To run:

```bash
# Development mode
wails dev

# Or run the built binary
./build/bin/reMarkable\ Template\ Manager.app/Contents/MacOS/reMarkable\ Template\ Manager
```

## Notes

- Backups are now completely independent of reMarkable software updates
- Users can store backups wherever they want (external drives, cloud sync folders, etc.)
- Compression reduces backup size significantly
- The backup is a standard ZIP file that can be extracted natively on Windows, macOS, and Linux
- No additional software needed to extract backups (unlike tar.gz on Windows)
- Users maintain full control over backup location and retention
