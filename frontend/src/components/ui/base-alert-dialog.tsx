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
import { LucideIcon, Loader2 } from "lucide-react";
import { ReactNode } from "react";

type Variant = "error" | "success" | "warning" | "info";

interface ActionConfig {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
}

export interface BaseAlertDialogProps {
  open: boolean;
  variant?: Variant;
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  primaryAction?: ActionConfig;
  secondaryAction?: ActionConfig;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
}

const variantStyles: Record<Variant, { bg: string; text: string }> = {
  error: { bg: "bg-destructive/10", text: "text-destructive" },
  success: { bg: "bg-primary/10", text: "text-primary" },
  warning: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  info: { bg: "bg-primary/10", text: "text-primary" },
};

const BaseAlertDialog = ({
  open,
  variant = "info",
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  onClose,
  closeOnOverlayClick = true,
}: BaseAlertDialogProps) => {
  const styles = variantStyles[variant];
  const hasSecondaryAction = !!secondaryAction;

  return (
    <AlertDialog
      open={open}
      onOpenChange={closeOnOverlayClick ? (isOpen) => !isOpen && onClose() : undefined}
    >
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="flex flex-col items-center text-center">
          <div
            className={`w-12 h-12 rounded-full ${styles.bg} flex items-center justify-center mb-2`}
          >
            <Icon className={`w-6 h-6 ${styles.text}`} />
          </div>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter
          className={
            hasSecondaryAction
              ? "flex-col gap-2 sm:flex-row"
              : "sm:justify-center"
          }
        >
          {secondaryAction && (
            <AlertDialogCancel
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled || secondaryAction.loading}
              className={secondaryAction.icon ? "gap-2" : ""}
            >
              {secondaryAction.loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                secondaryAction.icon && (
                  <secondaryAction.icon className="w-4 h-4" />
                )
              )}
              {secondaryAction.label}
            </AlertDialogCancel>
          )}
          {primaryAction ? (
            <AlertDialogAction
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled || primaryAction.loading}
              className={primaryAction.icon || primaryAction.loading ? "gap-2" : ""}
            >
              {primaryAction.loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                primaryAction.icon && <primaryAction.icon className="w-4 h-4" />
              )}
              {primaryAction.label}
            </AlertDialogAction>
          ) : (
            <AlertDialogAction onClick={onClose}>OK</AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BaseAlertDialog;
