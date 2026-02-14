import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface IPAddressInputProps
  extends Omit<React.ComponentProps<"input">, "type" | "defaultValue"> {
  label?: string;
  showHelperText?: boolean;
  helperText?: string;
  defaultValue?: string;
}

const IPAddressInput = React.forwardRef<HTMLInputElement, IPAddressInputProps>(
  (
    {
      className,
      label,
      showHelperText = true,
      helperText = "IP address can be found in Settings → Help → Copyrights and licenses",
      defaultValue = "10.11.99.1",
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-2">
        <Input
          type="text"
          className={cn("font-mono", className)}
          placeholder="10.11.99.1"
          defaultValue={defaultValue}
          ref={ref}
          aria-label={label}
          {...props}
        />
        {showHelperText && helperText && (
          <p className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

IPAddressInput.displayName = "IPAddressInput";

export { IPAddressInput };
