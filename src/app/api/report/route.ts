import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { company_name, review_content, report_reason, contact_name, contact_phone, evidence } = body

    // Validation
    if (!company_name || !review_content || !report_reason || !contact_name || !contact_phone) {
      return NextResponse.json(
        { success: false, error: '请填写所有必填项' },
        { status: 400 }
      )
    }

    // Phone validation
    if (!/^1[3-9]\d{9}$/.test(contact_phone)) {
      return NextResponse.json(
        { success: false, error: '请输入有效的手机号码' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Insert report into review_reports table
    const { error: insertError } = await supabase
      .from('review_reports')
      .insert({
        company_name,
        review_content,
        report_reason,
        contact_name,
        contact_phone,
        evidence: evidence || null,
        status: 'pending',
      })

    if (insertError) {
      console.error('Failed to insert report:', insertError)
      return NextResponse.json(
        { success: false, error: '提交失败，请重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '申诉已提交，我们将在72小时内处理您的请求。',
    })
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误，请重试' },
      { status: 500 }
    )
  }
}
