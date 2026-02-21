import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  open: boolean;
  message: string;
}

const LoadingOverlay = ({ open, message }: LoadingOverlayProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        className="max-w-xs"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AlertDialogHeader className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
          <AlertDialogTitle>{message}</AlertDialogTitle>
          <AlertDialogDescription>
            Please wait while the operation completes.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LoadingOverlay;
