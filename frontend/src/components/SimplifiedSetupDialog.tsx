import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { IPAddressInput } from "@/components/ui/ip-address-input";
import { GenerateSSHKey, UploadSSHKey } from "wailsjs/go/main/App";

interface SimplifiedSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onConnect: (keyPath: string, ip: string) => void;
}

const SimplifiedSetupDialog = ({
  open,
  onOpenChange,
  onBack,
  onConnect,
}: SimplifiedSetupDialogProps) => {
  const [ip, setIp] = useState("10.11.99.1");
  const [password, setPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setIp("10.11.99.1");
      setPassword("");
      setIsConnecting(false);
      setConnectionError(null);
    }
  }, [open]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ip.trim() || !password) return;

    setIsConnecting(true);
    setConnectionError(null);

    try {
      // Step 1: Generate a new SSH key
      const generatedKey = await GenerateSSHKey();
      
      // Step 2: Upload the key to the device and connect
      // UploadSSHKey already handles connection after upload
      await UploadSSHKey(generatedKey.path, ip, password);
      
      // Step 3: Notify parent to complete setup (which will save config)
      onConnect(generatedKey.path, ip);
    } catch (error) {
      console.error("Simplified setup failed:", error);
      setConnectionError(error instanceof Error ? error.message : String(error));
      setIsConnecting(false);
    }
  };

  const isFormValid = ip.trim() && password;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={onBack}
              className="p-1.5 rounded-md hover:bg-accent transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <DialogTitle className="font-serif text-xl">Simplified Setup</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Quick setup with just IP address and password
          </DialogDescription>
        </DialogHeader>

        {/* Info notice */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            This will automatically generate a new SSH key and securely configure your device.
          </p>
        </div>

        <form onSubmit={handleConnect} className="space-y-4 py-2">
          {/* Connection error message */}
          {connectionError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {connectionError}
            </div>
          )}

          <div className="space-y-3">
            {/* IP Address */}
            <div className="space-y-2">
              <Label htmlFor="ip">Device IP Address</Label>
              <IPAddressInput
                id="ip"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                disabled={isConnecting}
                label="Device IP Address"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Device Password</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter device password"
                disabled={isConnecting}
                label="Device Password"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Find your IP address and password in{" "}
            <span className="font-mono">Settings → Help → Copyrights and licenses</span>
          </p>

          {/* Connect Button */}
          <motion.div
            whileHover={{ scale: isFormValid && !isConnecting ? 1.01 : 1 }}
            whileTap={{ scale: isFormValid && !isConnecting ? 0.99 : 1 }}
          >
            <Button
              type="submit"
              variant="connect"
              size="lg"
              className="w-full gap-2"
              disabled={!isFormValid || isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Connect Device"
              )}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SimplifiedSetupDialog;
