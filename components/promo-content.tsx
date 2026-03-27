import React from "react";
import { cn } from "@/lib/utils";

interface PromoContentProps {
  variant?: "desktop" | "mobile";
  className?: string;
}

export function PromoContent({
  variant = "desktop",
  className,
}: PromoContentProps) {
  if (variant === "mobile") {
    return (
      <div className={cn("border-t border-border bg-muted/20 p-3", className)}>
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground/90 truncate">
              Lux Network
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Post-quantum blockchain infrastructure
            </p>
          </div>
          <a
            href="https://lux.network"
            className="text-xs text-primary hover:text-primary/80 font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            Learn more
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("border border-border rounded-lg p-4 bg-card", className)}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold tracking-tighter">
            Lux Network
          </h3>
          <p className="text-sm text-muted-foreground">
            Post-quantum blockchain with multi-consensus architecture
            and sovereign compute infrastructure.
          </p>
          <a
            href="https://lux.network"
            className="text-sm text-primary hover:text-primary/80 font-medium mt-2"
          >
            Visit lux.network
          </a>
        </div>
      </div>
    </div>
  );
}
