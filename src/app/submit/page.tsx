'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Tag {
  id: string
  label: string
}

const TAGS: Tag[] = [
  { id: '加班少', label: '加班少' },
  { id: '氛围好', label: '氛围好' },
  { id: '福利好', label: '福利好' },
  { id: '成长快', label: '成长快' },
  { id: '钱多', label: '钱多' },
  { id: '管理人性化', label: '管理人性化' },
  { id: '996', label: '996' },
  { id: '拖欠工资', label: '拖欠工资' },
  { id: '裁员多', label: '裁员多' },
  { id: '套路多', label: '套路多' },
]

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    company_name: '',
    identity: '',
    content: '',
    contact: '',
    agreed: false,
  })
  const [rating, setRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // 从 URL 参数读取预填企业名称
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const company = params.get('company')
    if (company) {
      setFormData(prev => ({ ...prev, company_name: decodeURIComponent(company) }))
    }
  }, [])

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.agreed) {
      setResult({ type: 'error', message: '请先阅读并同意用户协议' })
      return
    }
    setSubmitting(true)
    setResult(null)

    try {
      const overtime = selectedTags.length > 0 ? selectedTags.join('、') : ''
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: formData.company_name,
          content: formData.content,
          overtime: overtime || null,
          salary: null,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult({ type: 'success', message: '提交成功，感谢您的反馈！' })
        setFormData({ company_name: '', identity: '', content: '', contact: '', agreed: false })
        setRating(0)
        setSelectedTags([])
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
            <Link href="/submit" className="active">投稿</Link>
          </nav>
        </div>
      </header>

      <section className="form-section">
        <div className="form-card">
          <h1>提交企业评价</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            帮助济南求职者了解真实的公司情况
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
              <label htmlFor="identity">您的身份 *</label>
              <input
                type="text"
                id="identity"
                value={formData.identity}
                onChange={(e) => setFormData({ ...formData, identity: e.target.value })}
                placeholder="如：在职员工、离职员工、求职者等"
                required
              />
            </div>

            <div className="form-group">
              <label>综合评分 *</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 24,
                      color: star <= rating ? '#ffc107' : '#e0e0e0',
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="form-hint">{rating === 0 ? '请选择评分' : `${rating}星`}</p>
            </div>

            <div className="form-group">
              <label htmlFor="content">评价内容 *</label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="分享您的真实工作体验..."
                required
                rows={5}
              />
            </div>

            <div className="form-group">
              <label>标签（可多选）</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TAGS.map((tag) => (
                  <label
                    key={tag.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 12px',
                      borderRadius: 'var(--radius)',
                      border: selectedTags.includes(tag.id) ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                      background: selectedTags.includes(tag.id) ? 'var(--primary-color)' : 'transparent',
                      color: selectedTags.includes(tag.id) ? '#fff' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.id)}
                      onChange={() => handleTagToggle(tag.id)}
                      style={{ display: 'none' }}
                    />
                    {tag.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contact">联系方式（选填）</label>
              <input
                type="text"
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="邮箱或手机号（仅用于联系核实）"
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <input
                type="checkbox"
                id="agree"
                checked={formData.agreed}
                onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                style={{ marginTop: 4, width: 16, height: 16, cursor: 'pointer' }}
              />
              <label htmlFor="agree" style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.5 }}>
                我已阅读并同意<a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>《用户服务协议》</a>，承诺以上内容真实有效。
              </label>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? '提交中...' : '提交评价'}
            </button>
          </form>
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
