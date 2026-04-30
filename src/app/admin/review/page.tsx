'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

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

function AdminReviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queueId = searchParams.get('id')
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
        if (!currentItem && data.queue.length > 0) {
          setCurrentItem(data.queue[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error)
    } finally {
      setLoading(false)
    }
  }, [currentItem])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  // Handle action from URL params (Feishu notification buttons)
  useEffect(() => {
    if (queueId && actionParam) {
      handleAction(parseInt(queueId), actionParam as 'approve' | 'reject')
      // Clean URL
      router.replace('/admin/review')
    }
  }, [queueId, actionParam])

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setProcessing(true)
    try {
      const res = await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue_id: id, action }),
      })
      
      if (res.ok) {
        // Remove from local state
        setQueue(prev => prev.filter(item => item.id !== id))
        setCurrentItem(queue.find(item => item.id === id) || null)
        
        // Refetch to get next item
        if (queue.length <= 1) {
          fetchQueue()
        }
      }
    } catch (error) {
      console.error('Failed to process action:', error)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: 40, textAlign: 'center' }}>
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <section className="page-header">
      <div className="container">
        <h1>评论审核队列</h1>
        <p>待审核: {queue.length} 条</p>
      </div>
    </section>
  )
}

export default function AdminReviewPage() {
  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <Link href="/" className="logo">
            <div className="logo-icon">济</div>
            <div className="logo-text">济企通</div>
          </Link>
          <nav className="nav">
            <Link href="/admin/review" className="active">审核队列</Link>
          </nav>
        </div>
      </header>

      <Suspense fallback={
        <div className="container" style={{ padding: 40, textAlign: 'center' }}>
          <p>加载中...</p>
        </div>
      }>
        <AdminReviewContent />
      </Suspense>

      <section className="section">
        <div className="container">
          <Suspense fallback={
            <div className="form-card" style={{ textAlign: 'center' }}>
              <p>加载队列...</p>
            </div>
          }>
            <QueueList />
          </Suspense>
        </div>
      </section>
    </div>
  )
}

function QueueList() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [currentItem, setCurrentItem] = useState<QueueItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/queue')
      const data = await res.json()
      if (data.queue) {
        setQueue(data.queue)
        if (!currentItem && data.queue.length > 0) {
          setCurrentItem(data.queue[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error)
    } finally {
      setLoading(false)
    }
  }, [currentItem])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setProcessing(true)
    try {
      const res = await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue_id: id, action }),
      })
      
      if (res.ok) {
        setQueue(prev => prev.filter(item => item.id !== id))
        setCurrentItem(queue.find(item => item.id === id) || null)
        
        if (queue.length <= 1) {
          fetchQueue()
        }
      }
    } catch (error) {
      console.error('Failed to process action:', error)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="form-card" style={{ textAlign: 'center' }}>
        <p>加载队列...</p>
      </div>
    )
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
          {/* Main content */}
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
                      fontSize: 24, 
                      fontWeight: 700,
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
                        <span key={flag} style={{ 
                          padding: '4px 8px', 
                          background: '#fff', 
                          borderRadius: 4,
                          fontSize: 13
                        }}>
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>点评内容:</h3>
                  <div style={{ 
                    padding: 16, 
                    background: 'var(--bg-color)', 
                    borderRadius: 8,
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.8
                  }}>
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
                    onClick={() => handleAction(currentItem.id, 'approve')}
                    disabled={processing}
                    style={{
                      flex: 1,
                      padding: 14,
                      background: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 16,
                      fontWeight: 500,
                      cursor: processing ? 'not-allowed' : 'pointer',
                      opacity: processing ? 0.6 : 1
                    }}
                  >
                    ✅ 通过审核
                  </button>
                  <button
                    onClick={() => handleAction(currentItem.id, 'reject')}
                    disabled={processing}
                    style={{
                      flex: 1,
                      padding: 14,
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 16,
                      fontWeight: 500,
                      cursor: processing ? 'not-allowed' : 'pointer',
                      opacity: processing ? 0.6 : 1
                    }}
                  >
                    ❌ 拒绝
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Queue list */}
          <div>
            <div className="sidebar-card">
              <h4 style={{ marginBottom: 16 }}>待审核队列</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {queue.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setCurrentItem(item)}
                    style={{
                      padding: 12,
                      background: currentItem?.id === item.id ? 'var(--primary-color)' : 'var(--bg-color)',
                      color: currentItem?.id === item.id ? 'white' : 'inherit',
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}
                  >
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
