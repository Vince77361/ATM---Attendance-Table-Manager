import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:text-neutral-500",
        "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
