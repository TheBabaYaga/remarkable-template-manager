import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Key, Plus, Check, Loader2 } from "lucide-react";
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
import { ListSSHKeys, ConnectSSH, GenerateSSHKey, UploadSSHKey } from "wailsjs/go/main/App";

interface SSHKey {
  name: string;
  path: string;
  isGenerated?: boolean;
}

interface SSHKeySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onConnect: (keyPath: string, ip: string) => void;
}

type View = "question" | "select" | "credentials";

const SSHKeySelectionDialog = ({
  open,
  onOpenChange,
  onBack,
  onConnect,
}: SSHKeySelectionDialogProps) => {
  const [view, setView] = useState<View>("question");
  const [hasKeyOnDevice, setHasKeyOnDevice] = useState<boolean | null>(null);
  const [availableKeys, setAvailableKeys] = useState<SSHKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [selectedKey, setSelectedKey] = useState<SSHKey | null>(null);
  const [ip, setIp] = useState("10.11.99.1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Credentials view state
  const [password, setPassword] = useState("");

  // Load SSH keys from the system
  const loadSSHKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const keys = await ListSSHKeys();
      setAvailableKeys(keys.map(k => ({ name: k.name, path: k.path })));
    } catch (error) {
      console.error("Failed to load SSH keys:", error);
      setAvailableKeys([]);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  useEffect(() => {
    if (open) {
      setView("question");
      setHasKeyOnDevice(null);
      setSelectedKey(null);
      setIp("10.11.99.1");
      setPassword("");
      setIsGenerating(false);
      setIsConnecting(false);
      setConnectionError(null);
      loadSSHKeys();
    }
  }, [open]);

  const handleAnswerQuestion = (hasKey: boolean) => {
    setHasKeyOnDevice(hasKey);
    setView("select");
  };

  const handleSelectKey = async (key: SSHKey) => {
    // If user already has key on device, try to connect immediately
    if (hasKeyOnDevice) {
      setSelectedKey(key);
      setIsConnecting(true);
      setConnectionError(null);
      
      try {
        await ConnectSSH(key.path, ip);
        // Successfully connected
        onConnect(key.path, ip);
      } catch (error) {
        console.error("SSH connection failed:", error);
        setConnectionError(error instanceof Error ? error.message : String(error));
        setIsConnecting(false);
      }
    } else {
      // Need to upload key, go to credentials view
      setSelectedKey(key);
      setView("credentials");
    }
  };

  const handleBack = () => {
    if (view === "credentials") {
      setView("select");
    } else if (view === "select") {
      setView("question");
      setHasKeyOnDevice(null);
    } else {
      onBack();
    }
  };

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    
    try {
      const generatedKey = await GenerateSSHKey();
      
      const newKey: SSHKey = {
        name: generatedKey.name,
        path: generatedKey.path,
        isGenerated: true,
      };
      
      setAvailableKeys(prev => [...prev, newKey]);
      setSelectedKey(newKey);
      setView("credentials");
    } catch (error) {
      console.error("Failed to generate SSH key:", error);
      setConnectionError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey || !ip) return;

    setIsConnecting(true);
    setConnectionError(null);

    try {
      if (hasKeyOnDevice) {
        // Key already on device - just connect
        await ConnectSSH(selectedKey.path, ip);
        onConnect(selectedKey.path, ip);
      } else {
        // Need to upload key with password
        if (password) {
          await UploadSSHKey(selectedKey.path, ip, password);
          onConnect(selectedKey.path, ip);
        }
      }
    } catch (error) {
      console.error("Connection failed:", error);
      setConnectionError(error instanceof Error ? error.message : String(error));
      setIsConnecting(false);
    }
  };

  // If key is already on device, only need IP. Otherwise need IP + password
  const isConnectValid = selectedKey && ip.trim() && 
    (hasKeyOnDevice || password);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={handleBack}
              className="p-1.5 rounded-md hover:bg-accent transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <DialogTitle className="font-serif text-xl">
            {view === "question" && "SSH Key Connection"}
            {view === "select" && "Select SSH Key"}
            {view === "credentials" && (hasKeyOnDevice ? "Connect to Device" : "Upload Key to Device")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {view === "question" && "Do you already have an SSH key uploaded to your reMarkable?"}
            {view === "select" && (hasKeyOnDevice 
              ? "Choose the SSH key that's already on your device"
              : "Choose an SSH key to upload to your device"
            )}
            {view === "credentials" && (hasKeyOnDevice 
              ? "Enter the device IP to connect"
              : "Enter device credentials to upload your key"
            )}
          </DialogDescription>
        </DialogHeader>

        {view === "question" ? (
          <div className="space-y-3 py-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleAnswerQuestion(true)}
              className="flex items-center gap-3 w-full p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Yes, I have a key on my device</p>
                <p className="text-xs text-muted-foreground">I've previously uploaded an SSH key</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleAnswerQuestion(false)}
              className="flex items-center gap-3 w-full p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">No, I need to upload a key</p>
                <p className="text-xs text-muted-foreground">I'll select or generate a key to upload</p>
              </div>
            </motion.button>
          </div>
        ) : view === "select" ? (
          <div className="space-y-4 py-4">
            {/* IP Address input - show when connecting with existing key */}
            {hasKeyOnDevice && (
              <div className="space-y-2">
                <Label htmlFor="ip-select">Device IP Address</Label>
                <IPAddressInput
                  id="ip-select"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  disabled={isConnecting}
                  label="Device IP Address"
                />
              </div>
            )}

            {/* Connection error message */}
            {connectionError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {connectionError}
              </div>
            )}

            {/* Available Keys */}
            <div className="space-y-2">
              <Label>Available Keys</Label>
              <div className="space-y-2">
                {isLoadingKeys ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                  </div>
                ) : availableKeys.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No SSH keys found in ~/.ssh</p>
                    <p className="text-xs mt-1">Generate a new key below</p>
                  </div>
                ) : (
                  availableKeys.map((key) => (
                    <motion.button
                      key={key.path}
                      initial={key.isGenerated ? { opacity: 0, y: -10 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectKey(key)}
                      disabled={isConnecting || (hasKeyOnDevice && !ip.trim())}
                      className="flex items-center gap-3 w-full p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
                        {isConnecting && selectedKey?.path === key.path ? (
                          <Loader2 className="w-4 h-4 text-foreground animate-spin" />
                        ) : (
                          <Key className="w-4 h-4 text-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{key.name}</p>
                          {key.isGenerated && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono truncate">{key.path}</p>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </div>

            {/* Generate new key button - only show if uploading */}
            {!hasKeyOnDevice && (
              <button
                onClick={handleGenerateKey}
                disabled={isGenerating}
                className="flex items-center gap-2 w-full p-3 rounded-lg border border-dashed border-border hover:border-primary hover:bg-accent transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {isGenerating ? "Generating key..." : "Generate new key"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isGenerating ? "Please wait..." : "Create a new SSH key pair for this device"}
                  </p>
                </div>
              </button>
            )}

          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-4 py-4">
            {/* Show selected key info */}
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Key className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">{selectedKey?.name}</span>
                {selectedKey?.isGenerated && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    NEW
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono">{selectedKey?.path}</p>
            </div>

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
                  showHelperText={false}
                />
              </div>

              {/* Password - only when uploading key */}
              {!hasKeyOnDevice && (
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
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {hasKeyOnDevice 
                ? <>IP address can be found in{" "}<span className="font-mono">Settings → Help → Copyrights and licenses</span></>
                : <>IP address and password can be found in{" "}<span className="font-mono">Settings → Help → Copyrights and licenses</span></>
              }
            </p>

            {/* Connect Button */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                type="submit"
                variant="connect"
                size="lg"
                className="w-full gap-2"
                disabled={!isConnectValid || isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {hasKeyOnDevice ? "Connecting..." : "Uploading key..."}
                  </>
                ) : (
                  hasKeyOnDevice ? "Connect" : "Upload Key & Connect"
                )}
              </Button>
            </motion.div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SSHKeySelectionDialog;
