import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { queue_id, action } = body
    
    if (!queue_id || !action) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }
    
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: '无效的操作' },
        { status: 400 }
      )
    }
    
    const supabase = createServerClient()
    
    // Get queue item
    const { data: queueItem, error: getError } = await supabase
      .from('review_queue')
      .select('*')
      .eq('id', parseInt(queue_id))
      .single()
    
    if (getError || !queueItem) {
      return NextResponse.json(
        { error: '未找到待审核内容' },
        { status: 404 }
      )
    }
    
    if (queueItem.status !== 'pending') {
      return NextResponse.json(
        { error: '该内容已处理' },
        { status: 400 }
      )
    }
    
    if (action === 'approve') {
      // Find or create company
      let companyId: number
      
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('name', queueItem.company_name)
        .single()
      
      if (existingCompany) {
        companyId = existingCompany.id
      } else {
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert({ name: queueItem.company_name })
          .select('id')
          .single()
        
        if (createError || !newCompany) {
          console.error('Failed to create company:', createError)
          return NextResponse.json(
            { error: '创建公司失败' },
            { status: 500 }
          )
        }
        companyId = newCompany.id
      }
      
      // Insert review
      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          company_id: companyId,
          content: queueItem.content,
          overtime: queueItem.overtime,
          salary: queueItem.salary,
        })
      
      if (insertError) {
        console.error('Failed to insert review:', insertError)
        return NextResponse.json(
          { error: '发布点评失败' },
          { status: 500 }
        )
      }
      
    }
    
    // Update queue status
    const { error: updateError } = await supabase
      .from('review_queue')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        processed_at: new Date().toISOString(),
      })
      .eq('id', parseInt(queue_id))
    
    if (updateError) {
      console.error('Failed to update queue:', updateError)
      return NextResponse.json(
        { error: '更新状态失败' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: action === 'approve' ? '已通过审核' : '已拒绝'
    })
    
  } catch (error) {
    console.error('Approve error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
