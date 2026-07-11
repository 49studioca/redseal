"use client";

import { Lock } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useUpgrade } from "@/components/subscription/upgrade-provider";

type UpgradeButtonProps = {
  label?: string;
  showLockIcon?: boolean;
} & Pick<ButtonProps, "size" | "variant" | "className">;

export function UpgradeButton({
  label = "Upgrade to unlock",
  showLockIcon = true,
  size = "sm",
  variant = "secondary",
  className,
}: UpgradeButtonProps) {
  const { openUpgrade } = useUpgrade();

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      onClick={openUpgrade}
    >
      {showLockIcon && <Lock className="h-3.5 w-3.5" />}
      {label}
    </Button>
  );
}
