'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// ============================================================
// Types
// ============================================================
interface QueueItem {
  id: number
  company_name: string
  content: string
  overtime: string | null
  salary: string | null
  ai_confidence: number
  ai_flags: string[]
  created_at: string
}

interface Review {
  id: number
  content: string
  overtime: string | null
  salary: string | null
  created_at: string
  company: { id: number; name: string } | null
}

interface ReviewsResponse {
  reviews: Review[]
  total: number
  page: number
  pageSize: number
}

// ============================================================
// Main Page
// ============================================================
export default function AdminReviewPage() {
  const [activeTab, setActiveTab] = useState<'queue' | 'reviews'>('queue')

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <Link href="/" className="logo">
            <div className="logo-icon">济</div>
            <div className="logo-text">济企通</div>
          </Link>
          <nav className="nav">
            <Link href="/admin/review" className="active">后台管理</Link>
          </nav>
        </div>
      </header>

      <section className="page-header">
        <div className="container">
          <h1>内容管理</h1>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button
              onClick={() => setActiveTab('queue')}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                background: activeTab === 'queue' ? 'var(--primary-color)' : '#e5e7eb',
                color: activeTab === 'queue' ? 'white' : '#374151',
              }}
            >
              审核队列
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                background: activeTab === 'reviews' ? 'var(--primary-color)' : '#e5e7eb',
                color: activeTab === 'reviews' ? 'white' : '#374151',
              }}
            >
              点评管理
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {activeTab === 'queue' ? (
            <Suspense fallback={<div className="form-card" style={{ textAlign: 'center' }}><p>加载中...</p></div>}><ReviewQueue /></Suspense>
          ) : <ReviewsManager />}
        </div>
      </section>
    </div>
  )
}

// ============================================================
// Tab 1: 审核队列（原有功能保留）
// ============================================================
function ReviewQueue() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queueIdParam = searchParams.get('id')
  const actionParam = searchParams.get('action')

  const [queue, setQueue] = useState<QueueItem[]>([])
  const [currentItem, setCurrentItem] = useState<QueueItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/queue')
      const data = await res.json()
      if (data.queue) {
        setQueue(data.queue)
        if (data.queue.length > 0 && !currentItem) {
          setCurrentItem(data.queue[0])
        } else if (currentItem) {
          const stillExists = data.queue.find((item: QueueItem) => item.id === currentItem.id)
          if (!stillExists) {
            setCurrentItem(data.queue[0] || null)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error)
    } finally {
      setLoading(false)
    }
  }, [currentItem])

  useEffect(() => { fetchQueue() }, [])

  useEffect(() => {
    if (queueIdParam && actionParam) {
      const id = parseInt(queueIdParam)
      const action = actionParam as 'approve' | 'reject'
      if (['approve', 'reject'].includes(action)) {
        performAction(id, action)
      }
      router.replace('/admin/review')
    }
  }, [queueIdParam, actionParam])

  const performAction = async (id: number, action: 'approve' | 'reject') => {
    setProcessing(true)
    try {
      const res = await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue_id: id, action }),
      })
      if (res.ok) {
        await fetchQueue()
      }
    } catch (error) {
      console.error('Failed to process action:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除此待审条目？')) return
    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/queue?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchQueue()
      } else {
        alert('删除失败')
      }
    } catch {
      alert('删除失败')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <div className="form-card" style={{ textAlign: 'center' }}><p>加载中...</p></div>
  }

  return (
    <>
      {queue.length === 0 ? (
        <div className="form-card" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 16 }}>🎉 太棒了！</h2>
          <p style={{ color: 'var(--text-secondary)' }}>目前没有待审核的内容</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }}>
          <div>
            {currentItem && (
              <div className="form-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 700 }}>{currentItem.company_name}</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                      提交时间: {new Date(currentItem.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>AI风险评分</p>
                    <p style={{
                      fontSize: 24, fontWeight: 700,
                      color: currentItem.ai_confidence > 0.6 ? '#dc2626' : currentItem.ai_confidence > 0.4 ? '#f59e0b' : '#16a34a'
                    }}>
                      {(currentItem.ai_confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                {currentItem.ai_flags.length > 0 && (
                  <div style={{ marginBottom: 24, padding: 16, background: '#fef3c7', borderRadius: 8 }}>
                    <p style={{ fontWeight: 500, marginBottom: 8 }}>⚠️ AI标记:</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {currentItem.ai_flags.map(flag => (
                        <span key={flag} style={{ padding: '4px 8px', background: '#fff', borderRadius: 4, fontSize: 13 }}>{flag}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>点评内容:</h3>
                  <div style={{ padding: 16, background: 'var(--bg-color)', borderRadius: 8, whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {currentItem.content}
                  </div>
                </div>

                {currentItem.overtime && (
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>加班情况:</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{currentItem.overtime}</p>
                  </div>
                )}
                {currentItem.salary && (
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>薪资情况:</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{currentItem.salary}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                  <button
                    onClick={() => performAction(currentItem.id, 'approve')}
                    disabled={processing}
                    style={{
                      flex: 1, padding: 14, background: '#16a34a', color: 'white',
                      border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 500,
                      cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.6 : 1
                    }}
                  >✅ 通过审核</button>
                  <button
                    onClick={() => performAction(currentItem.id, 'reject')}
                    disabled={processing}
                    style={{
                      flex: 1, padding: 14, background: '#6b7280', color: 'white',
                      border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 500,
                      cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.6 : 1
                    }}
                  >❌ 拒绝</button>
                  <button
                    onClick={() => handleDelete(currentItem.id)}
                    disabled={processing}
                    style={{
                      padding: '14px 20px', background: '#dc2626', color: 'white',
                      border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 500,
                      cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.6 : 1
                    }}
                  >🗑 删除</button>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="sidebar-card">
              <h4 style={{ marginBottom: 16 }}>待审核队列 ({queue.length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {queue.map(item => (
                  <div key={item.id} onClick={() => setCurrentItem(item)} style={{
                    padding: 12,
                    background: currentItem?.id === item.id ? 'var(--primary-color)' : 'var(--bg-color)',
                    color: currentItem?.id === item.id ? 'white' : 'inherit',
                    borderRadius: 8, cursor: 'pointer'
                  }}>
                    <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{item.company_name}</p>
                    <p style={{ fontSize: 12, opacity: 0.8 }}>
                      {new Date(item.created_at).toLocaleDateString('zh-CN')} · AI {(item.ai_confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ============================================================
// Tab 2: 点评管理（新增：查看 + 删除已发布点评）
// ============================================================
function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [deletingOne, setDeletingOne] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/reviews?${params}`)
      const data: ReviewsResponse = await res.json()
      if (data.reviews) {
        setReviews(data.reviews)
        setTotal(data.total)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  // Clear selection when page/search changes
  useEffect(() => { setSelected(new Set()) }, [page, search])

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除这条点评？')) return
    setDeletingOne(id)
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchReviews()
      } else {
        alert('删除失败')
      }
    } catch {
      alert('删除失败')
    } finally {
      setDeletingOne(null)
    }
  }

  const handleBatchDelete = async () => {
    if (selected.size === 0) return
    if (!confirm(`确认删除选中的 ${selected.size} 条点评？`)) return
    setDeleting(true)
    try {
      const ids = Array.from(selected).join(',')
      const res = await fetch(`/api/admin/reviews?ids=${ids}`, { method: 'DELETE' })
      if (res.ok) {
        setSelected(new Set())
        await fetchReviews()
      } else {
        alert('批量删除失败')
      }
    } catch {
      alert('批量删除失败')
    } finally {
      setDeleting(false)
    }
  }

  const toggleSelect = (id: number) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const toggleSelectAll = () => {
    if (selected.size === reviews.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(reviews.map(r => r.id)))
    }
  }

  const toggleExpand = (id: number) => {
    const next = new Set(expanded)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpanded(next)
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="搜索公司名称或点评内容..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1) } }}
          style={{
            flex: 1, minWidth: 200, padding: '10px 14px',
            border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14
          }}
        />
        <button onClick={() => { setSearch(searchInput); setPage(1) }} style={btnStyle('#374151')}>搜索</button>
        <button onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }} style={btnStyle('#6b7280')}>重置</button>
        {selected.size > 0 && (
          <button onClick={handleBatchDelete} disabled={deleting} style={{ ...btnStyle('#dc2626'), opacity: deleting ? 0.6 : 1 }}>
            🗑 批量删除 ({selected.size})
          </button>
        )}
      </div>

      <div style={{ color: 'var(--text-muted)', marginBottom: 12, fontSize: 14 }}>
        共 {total} 条点评，第 {page}/{totalPages || 1} 页
      </div>

      {/* Table */}
      <div className="form-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'center', width: 40 }}>
                <input
                  type="checkbox"
                  checked={reviews.length > 0 && selected.size === reviews.length}
                  onChange={toggleSelectAll}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>公司</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>点评内容</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, width: 120 }}>时间</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, width: 80 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>加载中...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>暂无点评</td></tr>
            ) : reviews.map(review => (
              <tr key={review.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selected.has(review.id)}
                    onChange={() => toggleSelect(review.id)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 500 }}>{review.company?.name || '未知公司'}</div>
                </td>
                <td style={{ padding: '12px 16px', maxWidth: 400 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 380 }}>
                    {review.content}
                  </div>
                  {review.content.length > 80 && (
                    <button
                      onClick={() => toggleExpand(review.id)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--primary-color)',
                        cursor: 'pointer', fontSize: 12, padding: '2px 0'
                      }}
                    >
                      {expanded.has(review.id) ? '收起' : '展开全部'}
                    </button>
                  )}
                  {expanded.has(review.id) && (
                    <div style={{ marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                      {review.content}
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
                  {new Date(review.created_at).toLocaleDateString('zh-CN')}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingOne === review.id}
                    style={{
                      background: '#dc2626', color: 'white', border: 'none',
                      borderRadius: 6, padding: '6px 12px', fontSize: 13,
                      cursor: deletingOne === review.id ? 'not-allowed' : 'pointer',
                      opacity: deletingOne === review.id ? 0.6 : 1
                    }}
                  >
                    {deletingOne === review.id ? '...' : '🗑 删除'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ ...pageBtnStyle(), opacity: page === 1 ? 0.4 : 1 }}
          >上一页</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, page - 2)
            const p = start + i
            if (p > totalPages) return null
            return (
              <button key={p} onClick={() => setPage(p)} style={{ ...pageBtnStyle(), background: p === page ? 'var(--primary-color)' : '#e5e7eb', color: p === page ? 'white' : '#374151' }}>
                {p}
              </button>
            )
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ ...pageBtnStyle(), opacity: page === totalPages ? 0.4 : 1 }}
          >下一页</button>
        </div>
      )}
    </div>
  )
}

function btnStyle(color: string) {
  return {
    padding: '10px 16px', background: color, color: 'white',
    border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer'
  } as React.CSSProperties
}

function pageBtnStyle() {
  return {
    padding: '6px 14px', border: 'none', borderRadius: 6,
    fontSize: 14, cursor: 'pointer'
  } as React.CSSProperties
}
