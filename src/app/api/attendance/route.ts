import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const student_id = searchParams.get('student_id')
  const month = searchParams.get('month') // format: YYYY-MM

  let query = supabase.from('attendance_records').select('*')

  if (student_id) {
    query = query.eq('student_id', student_id)
  }

  const date = searchParams.get('date') // format: YYYY-MM-DD

  if (date) {
    query = query.eq('date', date)
  } else if (month) {
    const start = `${month}-01`
    const [year, mon] = month.split('-').map(Number)
    const nextMonth = mon === 12 ? `${year + 1}-01-01` : `${year}-${String(mon + 1).padStart(2, '0')}-01`
    query = query.gte('date', start).lt('date', nextMonth)
  }

  const { data, error } = await query.order('date', { ascending: false })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { student_id, date, status, note } = body

  if (!student_id || !date || !status) {
    return NextResponse.json({ success: false, error: '필수 항목을 입력해주세요.' }, { status: 400 })
  }

  const validStatuses = ['attend', 'absent_approved', 'absent_unapproved']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ success: false, error: '유효하지 않은 상태값입니다.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .insert({ student_id, date, status, note: note || null })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  // 인정결석이면 monthly_count 차감
  if (status === 'absent_approved') {
    const { data: student } = await supabase
      .from('students')
      .select('monthly_count')
      .eq('id', student_id)
      .single()

    if (student) {
      await supabase
        .from('students')
        .update({ monthly_count: Math.max(0, student.monthly_count - 1) })
        .eq('id', student_id)
    }
  }

  return NextResponse.json({ success: true, data }, { status: 201 })
}
