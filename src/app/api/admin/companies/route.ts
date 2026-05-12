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

    let query = supabase.from('companies').select('*')

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: companies, error, count } = await query
      .order('posts_count', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) {
      console.error('Companies query error:', error)
      return NextResponse.json({ error: '获取企业列表失败', detail: error.message }, { status: 500 })
    }

    return NextResponse.json({
      companies: companies || [],
      total: count || (companies || []).length,
      page,
      pageSize,
    })
  } catch (err) {
    console.error('Companies GET error:', err)
    return NextResponse.json({ error: '获取企业列表失败' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: '缺少企业ID' }, { status: 400 })

    const supabase = createServerClient()
    const { error } = await supabase.from('companies').update(updates).eq('id', id)
    if (error) return NextResponse.json({ error: '更新企业失败', detail: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Companies PATCH error:', err)
    return NextResponse.json({ error: '更新企业失败' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: '缺少企业ID' }, { status: 400 })

    const supabase = createServerClient()
    const { error } = await supabase.from('companies').delete().eq('id', parseInt(id))
    if (error) return NextResponse.json({ error: '删除企业失败', detail: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Companies DELETE error:', err)
    return NextResponse.json({ error: '删除企业失败' }, { status: 500 })
  }
}
