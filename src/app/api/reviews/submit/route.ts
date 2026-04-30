import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// AI Moderation patterns - simple keyword-based for initial screening
const MODERATION_PATTERNS = {
  // XSS/Script injection
  xss: /<script|javascript:|on\w+=|alert\(|document\.cookie/gi,
  
  // Phone numbers (privacy)
  phone: /1[3-9]\d{9}/g,
  
  // WeChat IDs (privacy)
  wechat: /[微微信][信号:#]?\s*[：:]?\s*[a-zA-Z0-9_]{6,20}/gi,
  
  // Profanity (basic Chinese)
  profanity: /傻逼|SB|sb|sb|智障|废物|垃圾人|变态|人渣/gi,
}

interface ModerationResult {
  passed: boolean
  confidence: number
  flags: string[]
}

function moderateContent(content: string, companyName: string): ModerationResult {
  const flags: string[] = []
  let riskScore = 0
  
  // Check for XSS
  if (MODERATION_PATTERNS.xss.test(content)) {
    flags.push('xss_detected')
    riskScore += 0.9
  }
  
  // Check for phone numbers
  if (MODERATION_PATTERNS.phone.test(content)) {
    flags.push('phone_detected')
    riskScore += 0.3
  }
  
  // Check for WeChat
  if (MODERATION_PATTERNS.wechat.test(content)) {
    flags.push('wechat_detected')
    riskScore += 0.3
  }
  
  // Check for profanity
  if (MODERATION_PATTERNS.profanity.test(content)) {
    flags.push('profanity_detected')
    riskScore += 0.5
  }
  
  // Check company name for special characters
  if (/[<>\"']/.test(companyName)) {
    flags.push('suspicious_company_name')
    riskScore += 0.5
  }
  
  // Content length check
  if (content.length < 20) {
    flags.push('content_too_short')
    riskScore += 0.2
  }
  
  // Normalize risk score to 0-1
  const confidence = Math.min(riskScore, 1)
  
  // Pass if risk is low (below 0.4)
  // Flag for manual review if risk is medium (0.4-0.7)
  // Auto-reject if risk is high (above 0.7)
  const passed = riskScore < 0.7
  
  return { passed, confidence, flags }
}

async function notifyFeishuReview(companyName: string, content: string, queueId: number) {
  const webhookUrl = process.env.FEISHU_WEBHOOK_URL
  
  if (!webhookUrl) {
    console.error('FEISHU_WEBHOOK_URL not configured')
    return false
  }
  
  // Truncate content for Feishu message
  const truncatedContent = content.length > 300 
    ? content.substring(0, 300) + '...' 
    : content
  
  const message = {
    msg_type: 'interactive',
    card: {
      header: {
        title: {
          tag: 'plain_text',
          content: '⚠️ 济企通待审核点评'
        },
        template: 'orange'
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**公司名称：** ${companyName}`
          }
        },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**内容：**\n${truncatedContent}`
          }
        },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**Queue ID：** ${queueId}`
          }
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '✅ 通过'
              },
              type: 'primary',
              url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jiqitong.com'}/admin/review?id=${queueId}&action=approve`
            },
            {
              tag: 'button',
              text: {
                tag: 'plain_text',
                content: '❌ 拒绝'
              },
              type: 'danger',
              url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jiqitong.com'}/admin/review?id=${queueId}&action=reject`
            }
          ]
        }
      ]
    }
  }
  
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
    return res.ok
  } catch (error) {
    console.error('Failed to send Feishu notification:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { company_name, content, overtime, salary } = body
    
    // Validation
    if (!company_name || !content) {
      return NextResponse.json(
        { error: '公司名称和点评内容不能为空' },
        { status: 400 }
      )
    }
    
    // Moderation
    const moderation = moderateContent(content, company_name)
    
    const supabase = createServerClient()
    
    if (moderation.passed) {
      // Low risk - auto publish
      // First check if company exists, if not create it
      let companyId: number
      
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('name', company_name)
        .single()
      
      if (existingCompany) {
        companyId = existingCompany.id
      } else {
        // Create new company
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert({ name: company_name })
          .select('id')
          .single()
        
        if (createError || !newCompany) {
          console.error('Failed to create company:', createError)
          return NextResponse.json(
            { error: '系统错误，请重试' },
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
          content,
          overtime: overtime || null,
          salary_range: salary || null,
        })
      
      if (insertError) {
        console.error('Failed to insert review:', insertError)
        return NextResponse.json(
          { error: '系统错误，请重试' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        status: 'approved',
        message: '点评已发布'
      })
      
    } else {
      // Medium/High risk - add to queue for manual review
      const { data: queueItem, error: queueError } = await supabase
        .from('review_queue')
        .insert({
          company_name,
          content,
          overtime: overtime || null,
          salary: salary || null,
          status: 'pending',
          ai_confidence: moderation.confidence,
          ai_flags: moderation.flags,
        })
        .select('id')
        .single()
      
      if (queueError || !queueItem) {
        console.error('Failed to add to queue:', queueError)
        return NextResponse.json(
          { error: '系统错误，请重试' },
          { status: 500 }
        )
      }
      
      // Notify Feishu
      await notifyFeishuReview(company_name, content, queueItem.id)
      
      // Update notification status
      await supabase
        .from('review_queue')
        .update({ feishu_notified: true })
        .eq('id', queueItem.id)
      
      return NextResponse.json({
        status: 'pending',
        message: '你的点评正在审核中'
      })
    }
    
  } catch (error) {
    console.error('Submit error:', error)
    return NextResponse.json(
      { error: '服务器错误，请重试' },
      { status: 500 }
    )
  }
}
