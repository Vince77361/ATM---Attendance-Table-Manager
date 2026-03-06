-- Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  fee_per_class int NOT NULL DEFAULT 70000,
  monthly_count int NOT NULL DEFAULT 4,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('attend', 'absent-approved', 'absent-unapproved')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS attendance_records_student_id_idx ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS attendance_records_date_idx ON attendance_records(date);
