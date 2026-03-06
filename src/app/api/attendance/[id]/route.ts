import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { status, note, date } = body;
  console.log(body);

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
    console.log(data);
    console.log(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }, // 여기서 에러 뜸
    );
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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

  return NextResponse.json({ success: true });
}
