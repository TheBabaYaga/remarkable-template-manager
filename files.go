package main

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// shellEscape properly escapes a string for use in shell commands
func shellEscape(s string) string {
	// Use single quotes and escape any single quotes in the string
	return "'" + strings.ReplaceAll(s, "'", "'\"'\"'") + "'"
}

// SelectTemplateFile opens a native file dialog to select SVG or PNG files
func (a *App) SelectTemplateFile() (*SelectedFile, error) {
	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Template File",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Template Files (*.svg, *.png)",
				Pattern:     "*.svg;*.png",
			},
		},
	})

	if err != nil {
		return nil, fmt.Errorf("failed to open file dialog: %w", err)
	}

	// User cancelled
	if selection == "" {
		return nil, nil
	}

	// Validate file extension
	ext := strings.ToLower(filepath.Ext(selection))
	if ext != ".svg" && ext != ".png" {
		return nil, fmt.Errorf("invalid file type: only SVG and PNG files are allowed")
	}

	// Validate filename (without extension) - no spaces or special characters except - and _
	fileName := filepath.Base(selection)
	baseName := strings.TrimSuffix(fileName, ext)
	
	// Check if filename contains only alphanumeric characters, hyphens, and underscores
	validFilenamePattern := regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
	if !validFilenamePattern.MatchString(baseName) {
		return nil, fmt.Errorf("invalid filename: template filenames cannot contain spaces or special characters (except - and _). Invalid filename: %s", fileName)
	}

	return &SelectedFile{
		Name: fileName,
		Path: selection,
	}, nil
}

// SelectBackupDirectory opens a native directory dialog for selecting backup location
func (a *App) SelectBackupDirectory() (string, error) {
	selection, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Backup Location",
	})

	if err != nil {
		return "", fmt.Errorf("failed to open directory dialog: %w", err)
	}

	// User cancelled - return empty string
	if selection == "" {
		return "", nil
	}

	return selection, nil
}

// scpUploadFile uploads a local file to a remote directory via SSH
func (a *App) scpUploadFile(localPath, remoteDir string) error {
	// Read local file
	fileData, err := os.ReadFile(localPath)
	if err != nil {
		return fmt.Errorf("failed to read local file: %w", err)
	}

	fileName := filepath.Base(localPath)
	remotePath := remoteDir + fileName

	// Create SSH session
	session, err := a.sshClient.NewSession()
	if err != nil {
		return fmt.Errorf("failed to create SSH session: %w", err)
	}
	defer session.Close()

	// Get stdin pipe for writing
	stdin, err := session.StdinPipe()
	if err != nil {
		return fmt.Errorf("failed to get stdin pipe: %w", err)
	}

	// Start writing in a goroutine
	go func() {
		defer stdin.Close()
		stdin.Write(fileData)
	}()

	// Use cat to write the file with properly escaped path
	if err := session.Run(fmt.Sprintf("cat > %s", shellEscape(remotePath))); err != nil {
		return fmt.Errorf("failed to upload file: %w", err)
	}

	return nil
}

// downloadDirectoryRecursive downloads a directory from the reMarkable device recursively
func (a *App) downloadDirectoryRecursive(remotePath, localPath string) error {
	// Create local directory
	if err := os.MkdirAll(localPath, 0755); err != nil {
		return fmt.Errorf("failed to create local directory: %w", err)
	}

	// List files in remote directory
	session, err := a.sshClient.NewSession()
	if err != nil {
		return fmt.Errorf("failed to create SSH session: %w", err)
	}
	
	output, err := session.Output(fmt.Sprintf("ls -1p %s", shellEscape(remotePath)))
	session.Close()
	if err != nil {
		return fmt.Errorf("failed to list remote directory: %w", err)
	}

	// Parse file list
	files := strings.Split(strings.TrimSpace(string(output)), "\n")
	
	for _, file := range files {
		if file == "" {
			continue
		}
		
		remoteFile := filepath.Join(remotePath, file)
		localFile := filepath.Join(localPath, file)
		
		// Check if it's a directory (ends with /)
		if strings.HasSuffix(file, "/") {
			// Recursively download subdirectory
			dirName := strings.TrimSuffix(file, "/")
			if err := a.downloadDirectoryRecursive(
				filepath.Join(remotePath, dirName),
				filepath.Join(localPath, dirName),
			); err != nil {
				return err
			}
		} else {
			// Download file
			if err := a.downloadFile(remoteFile, localFile); err != nil {
				return fmt.Errorf("failed to download %s: %w", file, err)
			}
		}
	}
	
	return nil
}

// downloadFile downloads a single file from the reMarkable device
func (a *App) downloadFile(remotePath, localPath string) error {
	session, err := a.sshClient.NewSession()
	if err != nil {
		return fmt.Errorf("failed to create SSH session: %w", err)
	}
	defer session.Close()

	// Read remote file content with properly escaped path
	output, err := session.Output(fmt.Sprintf("cat %s", shellEscape(remotePath)))
	if err != nil {
		return fmt.Errorf("failed to read remote file: %w", err)
	}

	// Write to local file
	if err := os.WriteFile(localPath, output, 0644); err != nil {
		return fmt.Errorf("failed to write local file: %w", err)
	}

	return nil
}

// compressDirectory creates a zip archive from a directory
func compressDirectory(sourceDir, targetFile string) error {
	// Create the target file
	outFile, err := os.Create(targetFile)
	if err != nil {
		return fmt.Errorf("failed to create archive file: %w", err)
	}
	defer outFile.Close()

	// Create zip writer
	zipWriter := zip.NewWriter(outFile)
	defer zipWriter.Close()

	// Walk through the source directory
	return filepath.Walk(sourceDir, func(file string, fi os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories (zip will create them automatically)
		if fi.IsDir() {
			return nil
		}

		// Get relative path for the file in the archive
		relPath, err := filepath.Rel(sourceDir, file)
		if err != nil {
			return err
		}

		// Create zip file header
		header, err := zip.FileInfoHeader(fi)
		if err != nil {
			return err
		}
		header.Name = relPath
		header.Method = zip.Deflate // Use compression

		// Create file in zip
		writer, err := zipWriter.CreateHeader(header)
		if err != nil {
			return err
		}

		// Open and copy file content
		f, err := os.Open(file)
		if err != nil {
			return err
		}
		defer f.Close()

		if _, err := io.Copy(writer, f); err != nil {
			return err
		}

		return nil
	})
}
