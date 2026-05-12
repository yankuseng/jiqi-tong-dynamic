import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET: 获取企业管理列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const offset = (page - 1) * pageSize

    const supabase = createServerClient()

    let query = supabase
      .from('companies')
      .select('id, name, business, posts_count, rating, summary, created_at', { count: 'exact' })

    if (search) {
      query = query.or(`name.ilike.%${search}%,business.ilike.%${search}%`)
    }

    const { data: companies, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) throw error

    const companyIds = (companies || []).map((c: any) => c.id)
    let reviewCounts: Record<number, number> = {}
    if (companyIds.length > 0) {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('company_id', { count: 'exact' })
        .in('company_id', companyIds)
      for (const r of (reviews || [])) {
        reviewCounts[r.company_id] = (reviewCounts[r.company_id] || 0) + 1
      }
    }

    const enriched = (companies || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      industry: c.business || '-',
      employees: '-',
      rating: c.rating || 0,
      pv: c.posts_count || 0,
      status: c.posts_count > 0 ? 'verified' : 'pending',
      reviews: c.posts_count || 0,
      created_at: c.created_at,
    }))

    return NextResponse.json({ companies: enriched, total: count || 0, page, pageSize })
  } catch (err) {
    console.error('Companies GET error:', err)
    return NextResponse.json({ error: '获取企业列表失败' }, { status: 500 })
  }
}

// PATCH: 更新企业信息
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: '缺少企业ID' }, { status: 400 })

    const supabase = createServerClient()
    const { error } = await supabase.from('companies').update(updates).eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Companies PATCH error:', err)
    return NextResponse.json({ error: '更新企业失败' }, { status: 500 })
  }
}

// DELETE: 删除企业
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: '缺少企业ID' }, { status: 400 })

    const supabase = createServerClient()
    const { error } = await supabase.from('companies').delete().eq('id', parseInt(id))
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Companies DELETE error:', err)
    return NextResponse.json({ error: '删除企业失败' }, { status: 500 })
  }
}
