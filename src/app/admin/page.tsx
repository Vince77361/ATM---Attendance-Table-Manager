"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Student } from "@/types";
import {
  ArrowLeft,
  Database,
  Check,
  X,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { AddStudentModal } from "@/components/AddStudentModal";
import { Input, Button } from "@/components/ui";

type EditingRow = {
  id: string;
  name: string;
  fee_per_class: number;
  monthly_count: number;
};

export default function AdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    const res = await fetch("/api/students");
    const json = await res.json();
    if (json.success) setStudents(json.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const startEdit = (student: Student) => {
    setEditing({
      id: student.id,
      name: student.name,
      fee_per_class: student.fee_per_class,
      monthly_count: student.monthly_count,
    });
  };

  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    const res = await fetch(`/api/students/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editing.name,
        fee_per_class: editing.fee_per_class,
        monthly_count: editing.monthly_count,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.success) {
      setStudents((prev) =>
        prev.map((s) => (s.id === editing.id ? json.data : s)),
      );
      setEditing(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/students/${deleteTarget.id}`, { method: "DELETE" });
    setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
  };

  const isEditing = (id: string) => editing?.id === id;

  return (
    <div className="min-h-screen bg-gray-50">
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-sm text-gray-500 mb-4">
          학생별 수업료와 월 횟수를 조정합니다. 행을 클릭하면 편집됩니다.
        </p>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_160px_120px_100px] text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-200 px-4 py-3">
            <span>이름</span>
            <span>수업료 / 회 (원)</span>
            <span>월 수업 횟수</span>
            <span className="text-right">관리</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              불러오는 중...
            </div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              등록된 학생이 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {students.map((student, i) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`grid grid-cols-[1fr_160px_120px_100px] items-center px-4 py-3 transition-colors ${isEditing(student.id) ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  {isEditing(student.id) ? (
                    <Input
                      variant="compact"
                      type="text"
                      value={editing!.name}
                      onChange={(e) =>
                        setEditing((prev) =>
                          prev ? { ...prev, name: e.target.value } : null,
                        )
                      }
                      className="max-w-[200px] text-gray-900"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900">
                      {student.name}
                    </span>
                  )}

                  {isEditing(student.id) ? (
                    <Input
                      variant="compact"
                      type="number"
                      value={editing!.fee_per_class}
                      onChange={(e) =>
                        setEditing((prev) =>
                          prev
                            ? { ...prev, fee_per_class: Number(e.target.value) }
                            : null,
                        )
                      }
                      min={0}
                      step={1000}
                      className="max-w-[140px] text-gray-900"
                    />
                  ) : (
                    <span className="text-sm text-gray-700">
                      {student.fee_per_class.toLocaleString()}
                    </span>
                  )}

                  {isEditing(student.id) ? (
                    <Input
                      variant="compact"
                      type="number"
                      value={editing!.monthly_count}
                      onChange={(e) =>
                        setEditing((prev) =>
                          prev
                            ? { ...prev, monthly_count: Number(e.target.value) }
                            : null,
                        )
                      }
                      min={1}
                      className="max-w-[80px] text-gray-900"
                    />
                  ) : (
                    <span className="text-sm text-gray-700">
                      {student.monthly_count}회
                    </span>
                  )}

                  <div className="flex items-center justify-end gap-1">
                    {isEditing(student.id) ? (
                      <>
                        <Button
                          variant="icon"
                          size="icon"
                          onClick={saveEdit}
                          disabled={saving}
                          title="저장"
                          className="text-green-600 hover:text-green-700 hover:bg-green-100"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="icon"
                          size="icon"
                          onClick={cancelEdit}
                          title="취소"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="icon"
                          size="icon"
                          onClick={() => startEdit(student)}
                          title="편집"
                          className="hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="icon"
                          size="icon"
                          onClick={() => setDeleteTarget(student)}
                          title="삭제"
                          className="hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {students.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                총 {students.length}명
              </span>
              <span className="text-xs text-gray-500">
                월 기본 수업료 합계:{" "}
                <span className="font-semibold text-gray-700">
                  {students
                    .reduce(
                      (acc, s) => acc + s.fee_per_class * s.monthly_count,
                      0,
                    )
                    .toLocaleString()}
                  원
                </span>
              </span>
            </div>
          )}
        </div>
      </main>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog.Root
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm focus:outline-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-xl shadow-xl p-6"
            >
              <Dialog.Title className="text-base font-semibold text-gray-900 mb-2">
                학생 삭제
              </Dialog.Title>
              <p className="text-sm text-gray-600 mb-5">
                <span className="font-medium text-gray-900">
                  {deleteTarget?.name}
                </span>{" "}
                학생을 삭제하면 모든 출석 기록도 함께 삭제됩니다.
                계속하시겠습니까?
              </p>
              <div className="flex justify-end gap-2">
                <Dialog.Close asChild>
                  <Button variant="ghost">취소</Button>
                </Dialog.Close>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "삭제 중..." : "삭제"}
                </Button>
              </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AddStudentModal
        open={addStudentOpen}
        onOpenChange={setAddStudentOpen}
        onSuccess={fetchStudents}
      />
    </div>
  );
}
