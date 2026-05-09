import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, summary, location, industry, posts_count')
      .order('posts_count', { ascending: false })
      .limit(100)
    
    if (error) {
      console.error('Failed to fetch companies:', error)
      return NextResponse.json([], { status: 200 })
    }
    
    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Companies API error:', err)
    return NextResponse.json([], { status: 200 })
  }
}
