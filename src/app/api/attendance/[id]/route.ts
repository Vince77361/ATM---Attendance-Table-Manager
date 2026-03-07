import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { status, note, date } = body;

  // 상태가 바뀌는 경우 monthly_count 조정을 위해 이전 레코드 조회
  const { data: oldRecord } = await supabase
    .from("attendance_records")
    .select("status, student_id")
    .eq("id", id)
    .single();

  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (note !== undefined) updates.note = note;
  if (date !== undefined) updates.date = date;

  const { data, error } = await supabase
    .from("attendance_records")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  // 상태 변경이 있고 student_id를 알고 있을 때만 monthly_count 조정
  if (oldRecord && status !== undefined && status !== oldRecord.status) {
    const { data: student } = await supabase
      .from("students")
      .select("monthly_count")
      .eq("id", oldRecord.student_id)
      .single();

    if (student) {
      let delta = 0;
      if (oldRecord.status === "absent_approved") delta += 1; // 이전이 인정결석 → 복원
      if (status === "absent_approved") delta -= 1;           // 새로 인정결석 → 차감

      if (delta !== 0) {
        await supabase
          .from("students")
          .update({ monthly_count: Math.max(0, student.monthly_count + delta) })
          .eq("id", oldRecord.student_id);
      }
    }
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // 삭제 전 레코드 조회 (인정결석이면 monthly_count 복원 필요)
  const { data: record } = await supabase
    .from("attendance_records")
    .select("status, student_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("attendance_records")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  // 인정결석 삭제 시 monthly_count 복원
  if (record?.status === "absent_approved") {
    const { data: student } = await supabase
      .from("students")
      .select("monthly_count")
      .eq("id", record.student_id)
      .single();

    if (student) {
      await supabase
        .from("students")
        .update({ monthly_count: student.monthly_count + 1 })
        .eq("id", record.student_id);
    }
  }

  return NextResponse.json({ success: true });
}
