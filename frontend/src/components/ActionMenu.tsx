import { motion } from "framer-motion";
import { Download, UploadCloud, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ActionMenuProps {
  onBackup: () => void;
  onRestore: () => void;
  onManageTemplates: () => void;
}

const actions = [
  {
    key: "backup",
    label: "Backup",
    description: "Save all templates from your device",
    icon: Download,
    callbackKey: "onBackup" as const,
  },
  {
    key: "restore",
    label: "Restore",
    description: "Restore templates from a backup file",
    icon: UploadCloud,
    callbackKey: "onRestore" as const,
  },
  {
    key: "templates",
    label: "Manage Templates",
    description: "Add, remove, and sync templates",
    icon: FileText,
    callbackKey: "onManageTemplates" as const,
    span: 2,
  },
];

const ActionMenu = ({
  onBackup,
  onRestore,
  onManageTemplates,
}: ActionMenuProps) => {
  const callbacks = { onBackup, onRestore, onManageTemplates };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full max-w-sm"
    >
      <h3 className="text-lg font-serif font-medium text-foreground tracking-tight text-center mb-4">
        What would you like to do?
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
            className={action.span === 2 ? "col-span-2" : ""}
          >
            <Card
              className="border-border/50 cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50"
              onClick={callbacks[action.callbackKey]}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <action.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ActionMenu;
