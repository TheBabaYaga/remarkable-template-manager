package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

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

	// Use cat to write the file
	if err := session.Run(fmt.Sprintf("cat > %s", remotePath)); err != nil {
		return fmt.Errorf("failed to upload file: %w", err)
	}

	return nil
}
