import { NextResponse } from 'next/server'
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
      return NextResponse.json(
        { error: '获取队列失败' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ queue })
    
  } catch (error) {
    console.error('Queue API error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
