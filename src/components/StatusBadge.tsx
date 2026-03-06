"use client";

import { cn } from "@/lib/utils";

type Status = "attend" | "absent_approved" | "absent_unapproved";

const STATUS_MAP: Record<Status, { label: string; className: string }> = {
  attend: { label: "출석", className: "bg-green-100 text-green-800" },
  absent_approved: {
    label: "인정결석",
    className: "bg-yellow-100 text-yellow-800",
  },
  absent_unapproved: {
    label: "미인정결석",
    className: "bg-red-100 text-red-800",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = STATUS_MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        className,
      )}
    >
      {label}
    </span>
  );
}
