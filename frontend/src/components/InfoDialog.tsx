import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface InfoDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  icon: LucideIcon;
  iconClassName?: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
}

const InfoDialog = ({
  open,
  title,
  message,
  icon: Icon,
  iconClassName = "text-primary",
  onClose,
  onConfirm,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  showCancel = false,
}: InfoDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="flex flex-col items-center text-center">
          <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2`}>
            <Icon className={`w-6 h-6 ${iconClassName}`} />
          </div>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={showCancel ? "flex-col gap-2 sm:flex-row" : "sm:justify-center"}>
          {showCancel && (
            <AlertDialogCancel onClick={onClose}>
              {cancelLabel}
            </AlertDialogCancel>
          )}
          <AlertDialogAction onClick={onConfirm || onClose} className={showCancel ? "gap-2" : ""}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default InfoDialog;
