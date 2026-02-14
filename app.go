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
	config    *Config
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Try to load saved config
	config, err := LoadConfig()
	if err == nil && config != nil {
		a.config = config
	}
}

// GetVersion returns the application version
func (a *App) GetVersion() string {
	return Version
}

// LoadConfig loads the saved configuration
func (a *App) LoadConfig() (*Config, error) {
	config, err := LoadConfig()
	if err != nil {
		return nil, err
	}
	
	// Update internal config if loaded successfully
	if config != nil {
		a.config = config
	}
	
	return config, nil
}

// SaveConfig saves the connection configuration
func (a *App) SaveConfig(ip, sshKeyPath string) error {
	config := &Config{
		Version: configVersion,
		Device: DeviceConfig{
			IP:         ip,
			SSHKeyPath: sshKeyPath,
		},
	}
	
	if err := SaveConfig(config); err != nil {
		return err
	}
	
	// Update internal config
	a.config = config
	
	return nil
}

// DeleteConfig removes the saved configuration
func (a *App) DeleteConfig() error {
	if err := DeleteConfig(); err != nil {
		return err
	}
	
	// Clear internal config
	a.config = nil
	
	return nil
}

// GetConfigPath returns the path to the configuration file
func (a *App) GetConfigPath() (string, error) {
	return GetConfigPath()
}
