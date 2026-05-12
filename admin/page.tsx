'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Stats {
  companyCount: number
  reviewCount: number
  pendingAppealCount: number
  pendingReviewCount: number
}

interface RecentAppeal {
  id: number
  reason: string
  status: string
  created_at: string
  review?: { content: string; company_name: string }
}

interface TimelineItem {
  id: number
  title: string
  time: string
  type: 'company' | 'review' | 'appeal'
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ companyCount: 0, reviewCount: 0, pendingAppealCount: 0, pendingReviewCount: 0 })
  const [appeals, setAppeals] = useState<RecentAppeal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, appealsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/appeals?status=pending&pageSize=5'),
      ])
      const statsData = await statsRes.json()
      const appealsData = await appealsRes.json()
      setStats(statsData)
      setAppeals(appealsData.appeals || [])
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAppeal = async (appealId: number, action: 'approve' | 'reject') => {
    try {
      await fetch('/api/admin/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appeal_id: appealId, action }),
      })
      fetchData()
    } catch (err) {
      console.error('Failed to process appeal:', err)
    }
  }

  const statCards = [
    { label: '企业总数', key: 'companyCount' as const, sub: '+12 本月新增' },
    { label: '点评总数', key: 'reviewCount' as const, sub: '+8 本月新增' },
    { label: '待审申诉', key: 'pendingAppealCount' as const, sub: '需处理' },
    { label: '待审点评', key: 'pendingReviewCount' as const, sub: '需审核' },
  ]

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <Link href="/admin" className="logo">济企通<span style={{ color: 'var(--accent)' }}>.</span></Link>
          <span className="admin-tag">管理后台</span>
        </div>
        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-item active">📊 数据概览</Link>
          <Link href="/admin/companies" className="admin-nav-item">🏢 企业管理</Link>
          <Link href="/admin/appeals" className="admin-nav-item">⚠️ 申诉处理</Link>
          <Link href="/admin/reviews" className="admin-nav-item">📝 点评管理</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/">退出登录</Link>
        </div>
      </aside>

      <main className="admin-content">
        <h1 className="admin-page-title">数据概览</h1>

        <div className="stats-cards">
          {statCards.map((card) => (
            <div key={card.key} className="stat-card">
              <div className="label">{card.label}</div>
              <div className="num">{loading ? '-' : stats[card.key]}</div>
              <div className="sub">{card.sub}</div>
            </div>
          ))}
        </div>

        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>最近申诉</th>
                <th>申诉原因</th>
                <th>状态</th>
                <th>时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {appeals.length === 0 && !loading && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>暂无待处理申诉</td></tr>
              )}
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>加载中...</td></tr>
              ) : appeals.map((appeal) => (
                <tr key={appeal.id}>
                  <td style={{ fontWeight: 600 }}>{appeal.review?.company_name || '未知企业'}</td>
                  <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {appeal.reason}
                  </td>
                  <td>
                    <span className={`status-badge ${appeal.status === 'pending' ? 'pending' : appeal.status === 'approved' ? 'approved' : 'rejected'}`}>
                      {appeal.status === 'pending' ? '待处理' : appeal.status === 'approved' ? '已处理' : '已驳回'}
                    </span>
                  </td>
                  <td>{new Date(appeal.created_at).toLocaleDateString('zh-CN')}</td>
                  <td>
                    {appeal.status === 'pending' ? (
                      <>
                        <button onClick={() => handleAppeal(appeal.id, 'approve')} className="action-link" style={{ color: '#16a34a' }}>通过</button>
                        <button onClick={() => handleAppeal(appeal.id, 'reject')} className="action-link" style={{ color: '#dc2626' }}>驳回</button>
                      </>
                    ) : (
                      <Link href="/admin/appeals" className="action-link">查看</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="action-btns" style={{ marginTop: 24 }}>
          <Link href="/admin/companies" className="btn btn-primary">企业管理</Link>
          <Link href="/admin/appeals" className="btn btn-secondary">处理申诉</Link>
        </div>
      </main>
    </div>
  )
}
