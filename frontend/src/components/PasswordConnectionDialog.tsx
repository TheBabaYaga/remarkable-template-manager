import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PasswordInput } from "@/components/ui/password-input";
import { IPAddressInput } from "@/components/ui/ip-address-input";

interface PasswordConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  onConnect: (ip: string, password: string) => void;
}

const PasswordConnectionDialog = ({
  open,
  onOpenChange,
  onBack,
  onConnect,
}: PasswordConnectionDialogProps) => {
  const [ip, setIp] = useState("10.11.99.1");
  const [password, setPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    
    setIsConnecting(true);
    // Simulate connection attempt
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onConnect(ip, password);
    setIsConnecting(false);
  };

  const handleBack = () => {
    setPassword("");
    onBack();
  };

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
          <DialogTitle className="font-serif text-xl">Connect with Password</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your reMarkable's IP address and password
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ip" className="text-sm font-medium">
              IP Address
            </Label>
            <IPAddressInput
              id="ip"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              label="IP Address"
              helperText="IP address and password can be found in Settings → Help → Copyrights and licenses"
              showHelperText={false}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your device password"
              label="Password"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            IP address and password can be found in{" "}
            <span className="font-mono">Settings → Help → Copyrights and licenses</span>
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="pt-2"
          >
            <Button
              type="submit"
              variant="connect"
              size="lg"
              className="w-full"
              disabled={!password.trim() || isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordConnectionDialog;
