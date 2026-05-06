'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ReportPage() {
  const [formData, setFormData] = useState({
    company_name: '',
    review_content: '',
    report_reason: '',
    contact_name: '',
    contact_phone: '',
    evidence: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setResult({ type: 'success', message: '申诉已提交，我们将在72小时内处理您的请求。' })
        setFormData({ company_name: '', review_content: '', report_reason: '', contact_name: '', contact_phone: '', evidence: '' })
      } else {
        setResult({ type: 'error', message: data.error || '提交失败，请重试' })
      }
    } catch {
      setResult({ type: 'error', message: '网络错误，请重试' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <Link href="/" className="logo">
            <div className="logo-icon">济</div>
            <div className="logo-text">济企通</div>
          </Link>
          <nav className="nav">
            <Link href="/">首页</Link>
            <Link href="/companies">企业列表</Link>
            <Link href="/submit">投稿</Link>
          </nav>
        </div>
      </header>

      <section className="form-section">
        <div className="form-card" style={{ maxWidth: 640, margin: '0 auto' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>企业申诉</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
            如果您认为平台上的内容侵犯了您的合法权益，请填写以下信息提交申诉。
          </p>

          {result && (
            <div className={`alert alert-${result.type}`} style={{ marginBottom: 24 }}>
              {result.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="company_name">企业名称 *</label>
              <input
                type="text"
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="请输入企业全称"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="review_content">涉及的内容 *</label>
              <textarea
                id="review_content"
                value={formData.review_content}
                onChange={(e) => setFormData({ ...formData, review_content: e.target.value })}
                placeholder="请粘贴涉及的点评内容原文，或描述具体问题"
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="report_reason">申诉原因 *</label>
              <select
                id="report_reason"
                value={formData.report_reason}
                onChange={(e) => setFormData({ ...formData, report_reason: e.target.value })}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', fontSize: 14 }}
              >
                <option value="">请选择申诉原因</option>
                <option value="内容不实">内容不实（与事实不符）</option>
                <option value="侮辱诽谤">侮辱诽谤（恶意攻击）</option>
                <option value="隐私泄露">隐私泄露（暴露个人/企业隐私）</option>
                <option value="商业诋毁">商业诋毁（竞争对手恶意抹黑）</option>
                <option value="虚假信息">虚假信息（捏造事实）</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="evidence">证据说明</label>
              <textarea
                id="evidence"
                value={formData.evidence}
                onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                placeholder="请提供相关证据，如：事实说明、证据描述等（选填）"
                rows={3}
              />
              <p className="form-hint">充分的证据有助于我们更快处理您的申诉</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label htmlFor="contact_name">联系人 *</label>
                <input
                  type="text"
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="您的姓名"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact_phone">联系电话 *</label>
                <input
                  type="tel"
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="方便我们联系您"
                  required
                />
              </div>
            </div>

            <div style={{ padding: 16, background: 'var(--bg-color)', borderRadius: 'var(--radius)', marginBottom: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-color)' }}>处理说明：</strong>
              <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 1.8 }}>
                <li>我们将在 <strong>72小时内</strong> 处理您的申诉</li>
                <li>对于证据充分的内容（如虚假信息、隐私泄露），核实后立即删除</li>
                <li>对于主观感受类点评（如"氛围差"），平台尊重用户表达权利，无法删除</li>
                <li>您也可以选择在对应点评下方发表公开回应</li>
                <li>平台承诺：仅使用您的联系信息处理本次申诉，不会泄露给第三方</li>
              </ul>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? '提交中...' : '提交申诉'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link href="/terms" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              查看《用户服务协议与社区准则》
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-bottom">
            <p>© 2024 济企通 JiqiTong.com | 济南求职避坑指南</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
