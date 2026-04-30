'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SubmitPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCompany = searchParams.get('company') || ''

  const [formData, setFormData] = useState({
    company_name: preselectedCompany,
    content: '',
    overtime: '',
    salary: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)

    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        if (data.status === 'approved') {
          setResult({ type: 'success', message: '提交成功！你的点评已直接发布。' })
          setFormData({ company_name: '', content: '', overtime: '', salary: '' })
        } else if (data.status === 'pending') {
          setResult({ type: 'warning', message: '提交成功！你的点评正在审核中，审核通过后会显示。' })
          setFormData({ company_name: '', content: '', overtime: '', salary: '' })
        }
      } else {
        setResult({ type: 'error', message: data.error || '提交失败，请重试' })
      }
    } catch (error) {
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
            <Link href="/submit" className="active">投稿</Link>
          </nav>
        </div>
      </header>

      <section className="form-section">
        <div className="form-card">
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>分享你的工作经历</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
            帮助济南的求职者了解真实的公司情况，你的分享会让更多人少走弯路。
          </p>

          {result && (
            <div className={`alert alert-${result.type}`}>
              {result.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="company_name">公司名称 *</label>
              <input
                type="text"
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="请输入公司全称"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">点评内容 *</label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="分享你在该公司的工作体验，例如：
• 公司氛围怎么样
• 加班情况如何
• 薪资待遇
• 领导管理风格
• 建议给求职者的建议"
                required
              />
              <p className="form-hint">请客观真实地分享你的经历，审核通过后即可显示</p>
            </div>

            <div className="form-group">
              <label htmlFor="overtime">加班情况（选填）</label>
              <input
                type="text"
                id="overtime"
                value={formData.overtime}
                onChange={(e) => setFormData({ ...formData, overtime: e.target.value })}
                placeholder="例如：平时加班到7点，周六偶尔加班"
              />
            </div>

            <div className="form-group">
              <label htmlFor="salary">薪资情况（选填）</label>
              <input
                type="text"
                id="salary"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="例如：12K × 13薪"
              />
              <p className="form-hint">薪资信息会帮助求职者更好地评估offer</p>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? '提交中...' : '提交点评'}
            </button>
          </form>

          <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-color)', borderRadius: 'var(--radius)', fontSize: 14, color: 'var(--text-secondary)' }}>
            <strong>温馨提示：</strong>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>请勿发布虚假信息、恶意诋毁或涉及个人隐私的内容</li>
              <li>你的点评将有助于济南的求职者做出更好的选择</li>
              <li>提交后系统会自动审核，审核通过即可显示</li>
            </ul>
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
