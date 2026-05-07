import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: queue, error } = await supabase
      .from('review_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch queue:', error)
      return NextResponse.json({ error: '获取队列失败' }, { status: 500 })
    }

    return NextResponse.json({ queue })

  } catch (error) {
    console.error('Queue API error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// DELETE: 删除待审条目
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')
    const idsParam = searchParams.get('ids')

    if (!idParam && !idsParam) {
      return NextResponse.json({ error: '缺少ID' }, { status: 400 })
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
      .from('review_queue')
      .delete()
      .in('id', ids)

    if (deleteError) {
      console.error('Failed to delete queue items:', deleteError)
      return NextResponse.json({ error: '删除失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true, deleted: ids.length })

  } catch (error) {
    console.error('Delete queue error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
