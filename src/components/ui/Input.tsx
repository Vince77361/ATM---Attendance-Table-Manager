import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "compact";

const variantClass = {
  default: "border-gray-300 rounded-lg px-3 py-2",
  compact: "border-blue-300 rounded-md px-2 py-1",
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: Variant;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = "default", className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full border text-sm focus:outline-0 focus:text-gray-900",
        "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
        variantClass[variant],
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
