'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const TABS = ['', 'pending', 'published', 'rejected']
const TAB_LABELS = ['全部', '待审核', '已发布', '已删除']

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [tab, setTab] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const pageSize = 20

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (search) params.set('search', search)
    if (tab) params.set('status', tab)
    try {
      const res = await fetch(`/api/reviews?${params}`)
      const data = await res.json()
      setReviews(data.reviews || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search, tab])

  useEffect(() => { fetchReviews() }, [fetchReviews])
  useEffect(() => { setSelected(new Set()) }, [page, search, tab])

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除这条点评？')) return
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      if (res.ok) fetchReviews()
      else alert('删除失败')
    } catch { alert('删除失败') }
  }

  const handleBatchDelete = async () => {
    if (!selected.size) return
    if (!confirm(`确认删除选中的 ${selected.size} 条点评？`)) return
    setDeleting(true)
    try {
      const ids = Array.from(selected).join(',')
      const res = await fetch(`/api/reviews/batch?ids=${ids}`, { method: 'DELETE' })
      if (res.ok) { setSelected(new Set()); fetchReviews() }
      else alert('批量删除失败')
    } catch { alert('批量删除失败') }
    finally { setDeleting(false) }
  }

  const toggleSelect = (id: number) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }
  const toggleSelectAll = () => {
    selected.size === reviews.length ? setSelected(new Set()) : setSelected(new Set(reviews.map(r => r.id)))
  }
  const toggleExpand = (id: number) => {
    const next = new Set(expanded)
    next.has(id) ? next.delete(id) : next.add(id)
    setExpanded(next)
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
          <Link href="/admin/appeals" className="admin-nav-item">⚠️ 申诉处理</Link>
          <Link href="/admin/reviews" className="admin-nav-item active">📝 点评管理</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/">退出登录</Link>
        </div>
      </aside>

      <main className="admin-content">
        <h1 className="admin-page-title">点评管理</h1>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="搜索点评内容..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1) } }}
            style={{ flex: 1, minWidth: 200, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
          />
          <button onClick={() => { setSearch(searchInput); setPage(1) }} className="btn btn-secondary">搜索</button>
          {selected.size > 0 && (
            <button onClick={handleBatchDelete} disabled={deleting} className="btn btn-danger">
              🗑 批量删除 ({selected.size})
            </button>
          )}
        </div>

        <div className="admin-tabs" style={{ marginBottom: 16 }}>
          {TABS.map((t, i) => (
            <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); setPage(1) }}>
              {TAB_LABELS[i]}
            </button>
          ))}
        </div>

        <div style={{ color: 'var(--text-muted)', marginBottom: 12, fontSize: 14 }}>
          共 {total} 条点评
        </div>

        <div className="admin-table" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'center', width: 40 }}>
                  <input type="checkbox" checked={reviews.length > 0 && selected.size === reviews.length} onChange={toggleSelectAll} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>公司</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>点评内容</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, width: 100 }}>评分</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, width: 120 }}>时间</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, width: 80 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>加载中...</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>暂无点评</td></tr>
              ) : reviews.map((review) => (
                <tr key={review.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <input type="checkbox" checked={selected.has(review.id)} onChange={() => toggleSelect(review.id)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{review.company?.name || '-'}</td>
                  <td style={{ padding: '12px 16px', maxWidth: 300 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                      {review.content}
                    </div>
                    {review.content?.length > 80 && (
                      <button onClick={() => toggleExpand(review.id)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: 12, padding: '2px 0' }}>
                        {expanded.has(review.id) ? '收起' : '展开全部'}
                      </button>
                    )}
                    {expanded.has(review.id) && (
                      <div style={{ marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{review.content}</div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#F59E0B' }}>{'★'.repeat(review.rating || 0)}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 13 }}>{new Date(review.created_at).toLocaleDateString('zh-CN')}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button onClick={() => handleDelete(review.id)} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>🗑 删除</button>
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
              return <button key={p} onClick={() => setPage(p)} className={p === page ? 'active' : ''}>{p}</button>
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>下一页</button>
          </div>
        )}
      </main>
    </div>
  )
}
