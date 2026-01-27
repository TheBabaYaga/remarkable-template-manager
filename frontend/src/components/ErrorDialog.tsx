import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";
import { ReactNode } from "react";

interface ErrorDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  onClose: () => void;
}

const ErrorDialog = ({
  open,
  title,
  message,
  onClose,
}: ErrorDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction onClick={onClose}>
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ErrorDialog;
