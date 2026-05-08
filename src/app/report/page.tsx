'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ReportPage() {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    contact_phone: '',
    review_content: '',
    appeal_reason: '',
    description: '',
    materials: null as File | null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, materials: e.target.files[0] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)

    try {
      const payload = {
        company_name: formData.company_name,
        contact_name: formData.contact_name,
        contact_phone: formData.contact_phone,
        review_content: formData.review_content,
        appeal_reason: formData.appeal_reason,
        description: formData.description,
      }

      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setResult({ type: 'success', message: '申诉已提交，我们将在72小时内处理您的请求。' })
        setFormData({
          company_name: '',
          contact_name: '',
          contact_phone: '',
          review_content: '',
          appeal_reason: '',
          description: '',
          materials: null,
        })
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
                <label htmlFor="contact_phone">电话 *</label>
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

            <div className="form-group">
              <label htmlFor="review_content">被申诉点评 *</label>
              <textarea
                id="review_content"
                value={formData.review_content}
                onChange={(e) => setFormData({ ...formData, review_content: e.target.value })}
                placeholder="请粘贴被申诉的点评内容原文"
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="appeal_reason">申诉原因 *</label>
              <select
                id="appeal_reason"
                value={formData.appeal_reason}
                onChange={(e) => setFormData({ ...formData, appeal_reason: e.target.value })}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', fontSize: 14 }}
              >
                <option value="">请选择申诉原因</option>
                <option value="内容不实">内容不实</option>
                <option value="侮辱诽谤">侮辱诽谤</option>
                <option value="隐私泄露">隐私泄露</option>
                <option value="商业诋毁">商业诋毁</option>
                <option value="虚假信息">虚假信息</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">详细说明 *</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请详细描述您的申诉理由及相关证明材料"
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="materials">材料上传</label>
              <input
                type="file"
                id="materials"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                style={{ fontSize: 14 }}
              />
              <p className="form-hint">支持 JPG、PNG、PDF、DOC 格式，单个文件不超过 10MB</p>
            </div>

            <div style={{ padding: 16, background: 'var(--bg-color)', borderRadius: 'var(--radius)', marginBottom: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-color)' }}>处理说明：</strong>
              <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 1.8 }}>
                <li>我们将在 <strong>72小时内</strong> 处理您的申诉</li>
                <li>对于证据充分的内容，核实后立即处理</li>
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
