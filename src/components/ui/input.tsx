import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-[10px] border border-[#E5E0D8] bg-white px-4 text-[#1F2A37] placeholder:text-[#94A3B8] focus:border-[#C0271E] focus:outline-none focus:ring-2 focus:ring-[#C0271E]/20",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
