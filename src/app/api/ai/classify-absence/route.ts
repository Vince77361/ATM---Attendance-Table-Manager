import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `당신은 학원의 출석 관리를 돕는 AI 에이전트입니다.
학생이 제출한 결석 사유를 분석하여 '인정결석' 또는 '미인정결석'으로 분류해야 합니다.

[인정결석 기준]
- 본인 질병 또는 부상 (병원 진단서, 처방전 등 증빙 가능)
- 가족 상(喪) (부모, 조부모, 형제자매 사망)
- 천재지변 (태풍, 홍수, 폭설 등 불가항력적 상황)
- 학교 공식 행사 (수학여행, 체육대회, 시험 등)
- 의료 검진 (건강검진, 예방접종 등)
- 법원 출두, 군 입영 검사 등 공적 의무

[미인정결석 기준]
- 단순 피로 또는 귀찮음
- 사전 연락 없는 무단결석
- 게임, 여행, 놀이 등 개인적인 여가 활동
- 증빙 불가한 막연한 몸살 주장
- 가족 여행 (학교 행사 아닌 경우)
- 기타 정당한 사유 없는 결석

응답은 반드시 다음 JSON 형식으로만 답하세요:
{
  "result": "인정결석" | "미인정결석",
  "confidence": 0~100 사이의 숫자 (판단 확신도),
  "reason": "판단 근거를 2~3문장으로 설명",
  "suggestion": "학생/학부모에게 전달할 한 문장 안내"
}`

export async function POST(request: Request) {
  const body = await request.json()
  const { studentName, absenceReason } = body

  if (!absenceReason?.trim()) {
    return NextResponse.json({ success: false, error: '결석 사유를 입력해주세요.' }, { status: 400 })
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ success: false, error: 'OpenAI API 키가 설정되지 않았습니다.' }, { status: 500 })
  }

  const userMessage = studentName
    ? `학생 이름: ${studentName}\n결석 사유: ${absenceReason}`
    : `결석 사유: ${absenceReason}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const raw = completion.choices[0].message.content
  if (!raw) {
    return NextResponse.json({ success: false, error: 'AI 응답을 받지 못했습니다.' }, { status: 500 })
  }

  const parsed = JSON.parse(raw)

  return NextResponse.json({ success: true, data: parsed })
}
