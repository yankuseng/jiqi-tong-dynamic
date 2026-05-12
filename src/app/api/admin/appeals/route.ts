import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET: 获取申诉列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const offset = (page - 1) * pageSize

    const supabase = createServerClient()

    // Build query
    let query = supabase
      .from('appeals')
      .select('id, reason, status, created_at, review_id', { count: 'exact' })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (search) {
      query = query.ilike('reason', `%${search}%`)
    }

    const { data: appeals, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) throw error

    // Enrich with review + company info
    const reviewIds = (appeals || []).map((a: any) => a.review_id).filter(Boolean)
    let reviewMap: Record<number, any> = {}
    if (reviewIds.length > 0) {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('id, content, company_id')
        .in('id', reviewIds)
      const companyIds = (reviews || []).map((r: any) => r.company_id).filter(Boolean)
      let companyMap: Record<number, string> = {}
      if (companyIds.length > 0) {
        const { data: companies } = await supabase
          .from('companies')
          .select('id, name')
          .in('id', companyIds)
        companyMap = Object.fromEntries((companies || []).map((c: any) => [c.id, c.name]))
      }
      reviewMap = Object.fromEntries(
        (reviews || []).map((r: any) => [
          r.id,
          { content: r.content, company_name: companyMap[r.company_id] || '未知' }
        ])
      )
    }

    const enriched = (appeals || []).map((a: any) => ({
      ...a,
      review: a.review_id ? reviewMap[a.review_id] : null
    }))

    return NextResponse.json({ appeals: enriched, total: count || 0, page, pageSize })
  } catch (err) {
    console.error('Appeals GET error:', err)
    return NextResponse.json({ error: '获取申诉列表失败' }, { status: 500 })
  }
}

// POST: 处理申诉（通过/驳回）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appeal_id, action, admin_note } = body // action: approve | reject

    if (!appeal_id || !action) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: '无效操作' }, { status: 400 })
    }

    const supabase = createServerClient()
    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    // Update appeal status
    const { error: appealError } = await supabase
      .from('appeals')
      .update({ status: newStatus })
      .eq('id', appeal_id)

    if (appealError) throw appealError

    // If approved: also approve the review (move from review_queue to reviews)
    if (action === 'approve') {
      // Get appeal to find review_id
      const { data: appeal } = await supabase
        .from('appeals')
        .select('review_id')
        .eq('id', appeal_id)
        .single()

      if (appeal?.review_id) {
        // Move review from queue to published reviews
        const { data: queued } = await supabase
          .from('review_queue')
          .select('*')
          .eq('id', appeal.review_id)
          .single()

        if (queued) {
          // Insert into reviews
          const { error: insertError } = await supabase
            .from('reviews')
            .insert({
              content: queued.content,
              overtime: queued.overtime,
              salary: queued.salary,
              company_id: queued.company_id,
              status: 'published',
            })
          if (insertError) console.error('Insert review error:', insertError)

          // Delete from queue
          await supabase.from('review_queue').delete().eq('id', queued.id)
        }
      }
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (err) {
    console.error('Appeals POST error:', err)
    return NextResponse.json({ error: '处理申诉失败' }, { status: 500 })
  }
}
