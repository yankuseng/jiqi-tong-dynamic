import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .limit(3)
    
    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
        details: error,
        env: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_KEY?.slice(0, 20) + '...'
        }
      })
    }
    
    return NextResponse.json({
      status: 'ok',
      companies: data,
      count: data?.length || 0
    })
  } catch (err: any) {
    return NextResponse.json({
      status: 'exception',
      message: err.message,
      stack: err.stack?.slice(0, 500)
    }, { status: 500 })
  }
}
