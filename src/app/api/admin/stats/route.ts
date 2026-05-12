import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    const [
      { count: companyCount },
      { count: reviewCount },
      { count: pendingAppealCount },
      { count: pendingReviewCount },
    ] = await Promise.all([
      supabase.from('companies').select('id', { count: 'exact', head: true }),
      supabase.from('reviews').select('id', { count: 'exact', head: true }),
      supabase.from('appeals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('review_queue').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ])
    return NextResponse.json({
      companyCount: companyCount || 0,
      reviewCount: reviewCount || 0,
      pendingAppealCount: pendingAppealCount || 0,
      pendingReviewCount: pendingReviewCount || 0,
    })
  } catch (err) {
    console.error('Stats error:', err)
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 })
  }
}
