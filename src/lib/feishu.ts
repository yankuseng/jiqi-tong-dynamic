/**
 * 飞书 Webhook 通知模块
 * 用于向颜丙全的飞书发送济企通企业申诉通知
 */

const FEISHU_WEBHOOK_URL = process.env.FEISHU_WEBHOOK_URL || ''

interface ReportPayload {
  company_name: string
  review_content: string
  report_reason: string
  contact_name: string
  contact_phone: string
  evidence?: string
}

/**
 * 发送文本消息到飞书
 */
async function sendText(text: string): Promise<boolean> {
  if (!FEISHU_WEBHOOK_URL) {
    console.warn('[Feishu] FEISHU_WEBHOOK_URL not configured')
    return false
  }

  try {
    const res = await fetch(FEISHU_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msg_type: 'text',
        content: { text },
      }),
    })
    const data = await res.json()
    if (data.code === 0) {
      console.log('[Feishu] Message sent successfully')
      return true
    } else {
      console.error('[Feishu] Send failed:', data)
      return false
    }
  } catch (err) {
    console.error('[Feishu] Network error:', err)
    return false
  }
}

/**
 * 发送企业申诉通知到飞书
 */
export async function notifyReport(payload: ReportPayload): Promise<void> {
  const { company_name, review_content, report_reason, contact_name, contact_phone, evidence } = payload

  // 截取内容摘要
  const contentPreview = review_content.length > 200
    ? review_content.slice(0, 200) + '...'
    : review_content

  const evidenceNote = evidence ? `\n📎 证据：${evidence}` : ''

  const message = `🚨【济企通企业申诉】新申诉待处理

🏢 企业：${company_name}
⚠️ 原因：${report_reason}
📝 内容：
${contentPreview}${evidenceNote}
👤 联系人：${contact_name}
📞 电话：${contact_phone}

⏰ 请尽快登录后台处理：https://jiqi-tong-dynamic.vercel.app/admin/review`

  await sendText(message)
}
