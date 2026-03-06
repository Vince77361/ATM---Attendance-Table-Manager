import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "danger" | "ghost" | "outline" | "icon";
type Size = "md" | "sm" | "icon";

const variantClass = {
  primary: "bg-blue-600 text-white rounded-lg hover:bg-blue-700",
  danger: "bg-red-600  text-white rounded-lg hover:bg-red-700",
  ghost: "text-gray-600 hover:text-gray-900",
  outline: "border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50",
  icon: "text-gray-400 rounded-lg hover:text-gray-700 hover:bg-gray-100",
};

const sizeClass = {
  md: "px-4 py-2 text-sm",
  sm: "px-3 py-1.5 text-sm",
  icon: "p-1.5",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-medium transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
