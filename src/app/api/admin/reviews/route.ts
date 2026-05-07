import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const offset = (page - 1) * pageSize

    const supabase = createServerClient()

    // Step 1: Get reviews (simple query, no join)
    let reviewsQuery = supabase
      .from('reviews')
      .select('id, content, overtime, salary, company_id, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    // Step 2: If search, find matching company IDs first
    let companyIds: number[] | null = null
    if (search) {
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .ilike('name', `%${search}%`)
      companyIds = companies?.map(c => c.id) || []
      if (companyIds.length === 0) {
        return NextResponse.json({ reviews: [], total: 0, page, pageSize })
      }
      reviewsQuery = reviewsQuery.in('company_id', companyIds)
    }

    const { data: reviews, error } = await reviewsQuery

    if (error) {
      console.error('Reviews query error:', error)
      return NextResponse.json({
        error: '获取点评列表失败',
        detail: error.message,
        code: error.code
      }, { status: 500 })
    }

    // Step 3: Get company names for these reviews
    const allCompanyIds = [...new Set((reviews || []).map((r: any) => r.company_id).filter(Boolean))]
    let companyMap: Record<number, string> = {}
    if (allCompanyIds.length > 0) {
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .in('id', allCompanyIds)
      companyMap = Object.fromEntries((companies || []).map((c: any) => [c.id, c.name]))
    }

    // Step 4: Get total count
    let countQuery = supabase.from('reviews').select('id', { count: 'exact', head: true })
    if (companyIds) {
      countQuery = countQuery.in('company_id', companyIds)
    }
    const { count } = await countQuery

    // Combine
    const enriched = (reviews || []).map((r: any) => ({
      ...r,
      company: r.company_id ? { id: r.company_id, name: companyMap[r.company_id] || '未知' } : null
    }))

    return NextResponse.json({
      reviews: enriched,
      total: count || 0,
      page,
      pageSize
    })

  } catch (err) {
    console.error('Reviews API error:', err)
    return NextResponse.json({ error: '服务器错误', detail: String(err) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')
    const idsParam = searchParams.get('ids')

    if (!idParam && !idsParam) {
      return NextResponse.json({ error: '缺少点评ID' }, { status: 400 })
    }

    const supabase = createServerClient()
    let ids: number[] = []

    if (idParam) {
      ids = [parseInt(idParam)]
    } else if (idsParam) {
      ids = idsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: '无效的ID' }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .in('id', ids)

    if (deleteError) {
      console.error('Failed to delete reviews:', deleteError)
      return NextResponse.json({ error: '删除失败', detail: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, deleted: ids.length })

  } catch (error) {
    console.error('Delete review error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
