package main

import (
	"fmt"
)

// RebootDevice reboots the reMarkable device
func (a *App) RebootDevice() error {
	if a.sshClient == nil {
		return fmt.Errorf("not connected to reMarkable device")
	}

	session, err := a.sshClient.NewSession()
	if err != nil {
		return fmt.Errorf("failed to create SSH session: %w", err)
	}
	defer session.Close()

	// Run reboot command (this will disconnect the session)
	if err := session.Run("reboot"); err != nil {
		// Reboot command may return an error because it disconnects immediately
		// This is expected behavior
		return nil
	}

	return nil
}
