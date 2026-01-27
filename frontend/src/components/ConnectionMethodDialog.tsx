import { motion } from "framer-motion";
import { Key, Lock, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ConnectionMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMethod: (method: "ssh" | "password") => void;
}

const ConnectionMethodDialog = ({
  open,
  onOpenChange,
  onSelectMethod,
}: ConnectionMethodDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="font-serif text-xl">Connect your reMarkable</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose how you'd like to connect to your device
          </DialogDescription>
        </DialogHeader>

        {/* Developer mode notice */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">reMarkable Paper Pro:</span>{" "}
            First enable Developer Mode in{" "}
            <span className="font-mono text-[11px] bg-background px-1 py-0.5 rounded">
              Settings → General → Software → Advanced
            </span>
          </p>
        </div>

        <div className="grid gap-3 py-2">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelectMethod("ssh")}
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary group-hover:bg-background transition-colors">
              <Key className="w-5 h-5 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">SSH Key</h3>
              <p className="text-sm text-muted-foreground">
                Connect using your SSH key for secure access
              </p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelectMethod("password")}
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary group-hover:bg-background transition-colors">
              <Lock className="w-5 h-5 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Password</h3>
              <p className="text-sm text-muted-foreground">
                Connect using your device password
              </p>
            </div>
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionMethodDialog;
