import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, fee_per_class = 70000, monthly_count = 4 } = body

  if (!name?.trim()) {
    return NextResponse.json({ success: false, error: '이름을 입력해주세요.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('students')
    .insert({ name: name.trim(), fee_per_class, monthly_count })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data }, { status: 201 })
}
