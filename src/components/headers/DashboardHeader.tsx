"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Database, Sparkles, Plus } from "lucide-react";
import { AddStudentModal } from "@/components/modals";

export function DashboardHeader() {
  const [addStudentOpen, setAddStudentOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-base font-bold text-gray-900">출석 관리</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              href="/admin"
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="학생 관리"
            >
              <Database className="w-4 h-4" />
            </Link>
            <Link
              href="/ai"
              className="p-2 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="AI 판별"
            >
              <Sparkles className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setAddStudentOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              학생 추가
            </button>
          </div>
        </div>
      </header>

      <AddStudentModal
        open={addStudentOpen}
        onOpenChange={setAddStudentOpen}
        onSuccess={() => setAddStudentOpen(false)}
      />
    </>
  );
}
