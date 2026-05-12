'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Appeal {
  id: number
  reason: string
  status: string
  created_at: string
  review?: { content: string; company_name: string }
}

const STATUS_LABELS: Record<string, string> = {
  pending: '待处理',
  approved: '已处理',
  rejected: '已驳回',
}

const STATUS_TABS = ['', 'pending', 'approved', 'rejected']
const STATUS_TAB_LABELS = ['全部', '待处理', '已处理', '已驳回']

export default function AdminAppealsPage() {
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)

  const pageSize = 20

  const fetchAppeals = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (status) params.set('status', status)
      const res = await fetch(`/api/admin/appeals?${params}`)
      const data = await res.json()
      setAppeals(data.appeals || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Failed to fetch appeals:', err)
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => { fetchAppeals() }, [fetchAppeals])

  const handleAction = async (appealId: number, action: 'approve' | 'reject') => {
    setProcessing(appealId)
    try {
      await fetch('/api/admin/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appeal_id: appealId, action }),
      })
      fetchAppeals()
    } catch (err) {
      console.error('Failed to process appeal:', err)
    } finally {
      setProcessing(null)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <Link href="/admin" className="logo">济企通<span style={{ color: 'var(--accent)' }}>.</span></Link>
          <span className="admin-tag">管理后台</span>
        </div>
        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-item">📊 数据概览</Link>
          <Link href="/admin/companies" className="admin-nav-item">🏢 企业管理</Link>
          <Link href="/admin/appeals" className="admin-nav-item active">⚠️ 申诉处理</Link>
          <Link href="/admin/reviews" className="admin-nav-item">📝 点评管理</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/">退出登录</Link>
        </div>
      </aside>

      <main className="admin-content">
        <h1 className="admin-page-title">申诉处理</h1>

        <div className="admin-tabs">
          {STATUS_TABS.map((s, i) => (
            <button
              key={s}
              className={`admin-tab ${status === s ? 'active' : ''}`}
              onClick={() => { setStatus(s); setPage(1) }}
            >
              {STATUS_TAB_LABELS[i]}
            </button>
          ))}
        </div>

        <div style={{ color: 'var(--text-muted)', marginBottom: 12, fontSize: 14 }}>
          共 {total} 条申诉
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>加载中...</div>
        ) : appeals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>暂无申诉</div>
        ) : appeals.map((appeal) => (
          <div key={appeal.id} className="appeal-card">
            <div className="appeal-header">
              <span className="appeal-company">{appeal.review?.company_name || '未知企业'}</span>
              <div className="appeal-actions">
                <span className={`status-badge ${
                  appeal.status === 'pending' ? 'pending' :
                  appeal.status === 'approved' ? 'approved' : 'rejected'
                }`}>
                  {STATUS_LABELS[appeal.status] || appeal.status}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {new Date(appeal.created_at).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
            {appeal.review && (
              <div className="appeal-quote">引用点评：{appeal.review.content}</div>
            )}
            <div style={{ fontSize: 14, marginBottom: 12 }}>
              <strong>申诉理由：</strong>{appeal.reason}
            </div>
            {appeal.status === 'pending' && (
              <div className="appeal-actions">
                <button
                  className="btn btn-primary"
                  style={{ padding: '8px 16px' }}
                  disabled={processing === appeal.id}
                  onClick={() => handleAction(appeal.id, 'approve')}
                >
                  {processing === appeal.id ? '处理中...' : '✅ 通过'}
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px' }}
                  disabled={processing === appeal.id}
                  onClick={() => handleAction(appeal.id, 'reject')}
                >
                  驳回
                </button>
              </div>
            )}
          </div>
        ))}

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>上一页</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, page - 2)
              const p = start + i
              if (p > totalPages) return null
              return <button key={p} onClick={() => setPage(p)} className={p === page ? 'active' : ''}>{p}</button>
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>下一页</button>
          </div>
        )}
      </main>
    </div>
  )
}
