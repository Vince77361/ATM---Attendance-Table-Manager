"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Database, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { AddStudentModal } from "@/components/modals";

export function AdminHeader() {
  const [addStudentOpen, setAddStudentOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Database className="w-5 h-5 text-gray-600" />
            <h1 className="text-xl font-bold text-gray-900">학생 관리</h1>
          </div>
          <Button onClick={() => setAddStudentOpen(true)}>
            <Plus className="w-4 h-4" />
            학생 추가
          </Button>
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
