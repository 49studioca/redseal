import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[10px] font-bold transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-[#E12D2A] to-[#C2151B] text-white shadow-[0_4px_14px_rgba(244,161,26,0.4)] hover:brightness-105",
        secondary:
          "bg-white border-[1.5px] border-[#C0271E] text-[#C0271E] hover:bg-[#FCEBEC]",
        ghost: "bg-transparent text-[#475569] hover:bg-[#F3EFE8]",
        dark: "bg-[#1F2A37] text-white hover:bg-[#2a3744]",
        white: "bg-white text-[#D8232A] shadow-lg hover:brightness-[0.97]",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-[42px] px-[18px] text-sm",
        lg: "h-[52px] px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
