'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Company {
  id: number
  name: string
  industry: string
  employees: string
  rating: number
  pv: number
  status: string
  reviews: number
  created_at: string
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const pageSize = 20

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`/api/admin/companies?${params}`)
      const data = await res.json()
      setCompanies(data.companies || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Failed to fetch companies:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { fetchCompanies() }, [fetchCompanies])

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
          <Link href="/admin/companies" className="admin-nav-item active">🏢 企业管理</Link>
          <Link href="/admin/appeals" className="admin-nav-item">⚠️ 申诉处理</Link>
          <Link href="/admin/reviews" className="admin-nav-item">📝 点评管理</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/">退出登录</Link>
        </div>
      </aside>

      <main className="admin-content">
        <h1 className="admin-page-title">企业管理</h1>

        <div className="admin-search">
          <input
            type="text"
            placeholder="搜索企业名称..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1) } }}
          />
          <div className="filters">
            {['', 'verified', 'unverified'].map((s) => (
              <button
                key={s}
                className={`filter-pill ${statusFilter === s ? 'active' : ''}`}
                onClick={() => { setStatusFilter(s); setPage(1) }}
              >
                {s === '' ? '全部' : s === 'verified' ? '已认证' : '待认证'}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setSearch(searchInput); setPage(1) }}
            className="btn btn-primary"
          >
            搜索
          </button>
        </div>

        <div style={{ color: 'var(--text-muted)', marginBottom: 12, fontSize: 14 }}>
          共 {total} 家企业，第 {page}/{totalPages || 1} 页
        </div>

        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>企业名称</th>
                <th>行业</th>
                <th>员工规模</th>
                <th>评分</th>
                <th>点评数</th>
                <th>浏览量</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>加载中...</td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>暂无数据</td></tr>
              ) : companies.map((company) => (
                <tr key={company.id}>
                  <td style={{ fontWeight: 600 }}>{company.name}</td>
                  <td>{company.industry || '-'}</td>
                  <td>{company.employees || '-'}</td>
                  <td>{company.rating ? company.rating.toFixed(1) : '-'}</td>
                  <td>{company.reviews}</td>
                  <td>{company.pv || 0}</td>
                  <td>
                    <span className={`status-badge ${company.status === 'verified' ? 'approved' : 'pending'}`}>
                      {company.status === 'verified' ? '已认证' : '待认证'}
                    </span>
                  </td>
                  <td>
                    <Link href={`/companies/${company.id}`} className="action-link">查看</Link>
                    <button
                      className="action-link"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280' }}
                      onClick={async () => {
                        if (!confirm(`确认删除企业「${company.name}」？`)) return
                        const res = await fetch(`/api/admin/companies?id=${company.id}`, { method: 'DELETE' })
                        if (res.ok) fetchCompanies()
                        else alert('删除失败')
                      }}
                    >删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>上一页</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, page - 2)
              const p = start + i
              if (p > totalPages) return null
              return (
                <button key={p} onClick={() => setPage(p)} className={p === page ? 'active' : ''}>{p}</button>
              )
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>下一页</button>
          </div>
        )}
      </main>
    </div>
  )
}
