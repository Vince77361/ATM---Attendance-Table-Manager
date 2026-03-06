export type Student = {
  id: string;
  name: string;
  fee_per_class: number;
  monthly_count: number;
  created_at: string;
};

export type AttendanceRecord = {
  id: string;
  student_id: string;
  date: string;
  status: "attend" | "absent_approved" | "absent_unapproved";
  note: string | null;
  created_at: string;
};
