import { motion } from "framer-motion";
import { Zap, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SetupChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSetup: (type: "simplified" | "advanced") => void;
}

const SetupChoiceDialog = ({
  open,
  onOpenChange,
  onSelectSetup,
}: SetupChoiceDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="font-serif text-xl">How would you like to set up?</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose the setup method that works best for you
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          {/* Simplified Setup - Coming Soon */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectSetup("simplified")}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left group w-full"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/15 transition-colors">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground">Simplified Setup</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Quick and easy setup for non-technical users
                </p>
                <div className="mt-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium inline-block">
                    Coming Soon
                  </span>
                </div>
              </div>
            </motion.button>
          </div>

          {/* Advanced Setup */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelectSetup("advanced")}
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary group-hover:bg-background transition-colors">
              <Settings className="w-5 h-5 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Advanced Setup</h3>
              <p className="text-sm text-muted-foreground">
                Full control with SSH key configuration
              </p>
            </div>
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SetupChoiceDialog;
