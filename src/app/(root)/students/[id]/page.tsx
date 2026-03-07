"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Student, AttendanceRecord } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { AddAttendanceModal } from "@/components/modals";
import { Button } from "@/components/ui";
import { ArrowLeft, Plus, Trash2, ChevronDown } from "lucide-react";

function getMonthOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
    options.push({ value, label });
  }
  return options;
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [addAttendanceOpen, setAddAttendanceOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const monthOptions = getMonthOptions();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [studentsRes, recordsRes] = await Promise.all([
      fetch("/api/students"),
      fetch(`/api/attendance?student_id=${id}&month=${month}`),
    ]);
    const studentsJson = await studentsRes.json();
    const recordsJson = await recordsRes.json();

    if (studentsJson.success) {
      const found = studentsJson.data.find((s: Student) => s.id === id);
      if (!found) {
        router.push("/");
        return;
      }
      setStudent(found);
    }
    if (recordsJson.success) setRecords(recordsJson.data);
    setLoading(false);
  }, [id, month, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (recordId: string) => {
    if (!confirm("이 출석 기록을 삭제하시겠습니까?")) return;
    setDeletingId(recordId);
    await fetch(`/api/attendance/${recordId}`, { method: "DELETE" });
    setDeletingId(null);
    fetchData();
  };

  const handleDeleteStudent = async () => {
    if (
      !confirm(
        `${student?.name} 학생을 삭제하시겠습니까? 모든 출석 기록도 함께 삭제됩니다.`,
      )
    )
      return;
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    router.push("/");
  };

  const attend = records.filter((r) => r.status === "attend").length;
  const approvedAbsences = records.filter(
    (r) => r.status === "absent_approved",
  ).length;
  const unapprovedAbsences = records.filter(
    (r) => r.status === "absent_unapproved",
  ).length;
  // monthly_count는 인정결석 시 API에서 차감되므로 그대로 곱하면 됨
  const monthlyFee = student
    ? student.monthly_count * student.fee_per_class
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        불러오는 중...
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 이거는 일단 남겨둠.. */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{student.name}</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteStudent}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            학생 삭제
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Fee Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">수업료/회</p>
              <p className="text-lg font-semibold text-gray-900">
                {student.fee_per_class.toLocaleString()}원
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">청구 횟수</p>
              <p className="text-lg font-semibold text-gray-900">
                {student.monthly_count}회
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* 질문: 이런 건 constant화 시킬수 없는 건가?? */}
            {[
              {
                label: "출석",
                value: attend,
                color: "text-green-700",
                bg: "bg-green-50",
              },
              {
                label: "인정결석",
                value: approvedAbsences,
                color: "text-yellow-700",
                bg: "bg-yellow-50",
              },
              {
                label: "미인정결석",
                value: unapprovedAbsences,
                color: "text-red-700",
                bg: "bg-red-50",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`${s.bg} rounded-lg p-3 text-center`}
              >
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">이번 달 청구 수업료</p>
              <p className="text-sm text-gray-400">
                {student.monthly_count}회 ×{" "}
                {student.fee_per_class.toLocaleString()}원
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {monthlyFee.toLocaleString()}원
            </p>
          </div>
        </motion.div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">출석 기록</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
            <Button size="sm" onClick={() => setAddAttendanceOpen(true)}>
              <Plus className="w-4 h-4" />
              추가
            </Button>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white border border-gray-200 rounded-xl">
            <p>출석 기록이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((record, i) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(record.date + "T00:00:00").toLocaleDateString(
                        "ko-KR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "short",
                        },
                      )}
                    </p>
                    {record.note && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {record.note}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={record.status} />
                </div>
                <Button
                  variant="icon"
                  size="icon"
                  onClick={() => handleDelete(record.id)}
                  disabled={deletingId === record.id}
                  className="text-gray-300 hover:text-red-500 hover:bg-transparent"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <AddAttendanceModal
        open={addAttendanceOpen}
        onOpenChange={setAddAttendanceOpen}
        onSuccess={fetchData}
        students={[student]}
        defaultStudentId={student.id}
      />
    </div>
  );
}
