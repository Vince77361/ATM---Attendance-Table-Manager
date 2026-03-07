"use client";

import { usePathname } from "next/navigation";
import { DashboardHeader } from "./DashboardHeader";
import { AiHeader } from "./AiHeader";
import { AdminHeader } from "./AdminHeader";

export function AppHeader() {
  const pathname = usePathname();

  if (pathname === "/") return <DashboardHeader />;
  if (pathname === "/ai") return <AiHeader />;
  if (pathname === "/admin") return <AdminHeader />;

  // /students/[id] 등 나머지 페이지는 자체 헤더 사용
  return null;
}
