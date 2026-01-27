package main

import (
	"context"

	"golang.org/x/crypto/ssh"
)

// Version will be set at build time via ldflags
// Default to "dev" if not set during build
var Version = "dev"

// App struct
type App struct {
	ctx       context.Context
	sshClient *ssh.Client
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// GetVersion returns the application version
func (a *App) GetVersion() string {
	return Version
}
