'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Company {
  id: number
  name: string
  summary?: string
  location?: string
  industry?: string
  posts_count?: number
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCompanies()
  }, [])

  async function fetchCompanies() {
    try {
      const res = await fetch('/api/companies')
      if (res.ok) {
        const data = await res.json()
        setCompanies(data)
      } else {
        // Fallback: direct supabase query
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase
          .from('companies')
          .select('id, name, summary, location, industry, posts_count')
          .order('posts_count', { ascending: false })
          .limit(100)
        if (data) setCompanies(data)
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

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
            <Link href="/companies" className="active">企业列表</Link>
            <Link href="/submit">投稿</Link>
          </nav>
        </div>
      </header>

      <section className="page-section">
        <div className="section-header">
          <h1>济南企业点评列表</h1>
          <p className="section-desc">帮助求职者了解真实公司情况，让好企业被看见</p>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="搜索公司名称..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <>
            <div className="companies-grid">
              {filtered.length === 0 ? (
                <div className="empty-text" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0' }}>
                  {search ? '未找到匹配的企业' : '暂无企业数据'}
                </div>
              ) : (
                filtered.map((company) => (
                  <div key={company.id} className="company-card">
                    <div className="company-card-header">
                      <h3>
                        <Link href={`/companies/${company.id}`}>{company.name}</Link>
                      </h3>
                      {company.posts_count !== undefined && company.posts_count > 0 && (
                        <span className="review-count">{company.posts_count} 条点评</span>
                      )}
                    </div>
                    {company.summary && (
                      <p className="company-card-summary">{company.summary}</p>
                    )}
                    <div className="company-card-footer">
                      <div className="company-card-badges">
                        {company.location && <span className="badge">{company.location}</span>}
                        {company.industry && <span className="badge">{company.industry}</span>}
                      </div>
                      <div className="company-card-actions">
                        <Link href={`/companies/${company.id}`} className="btn-outline btn-sm">
                          查看详情
                        </Link>
                        <Link href={`/submit?company=${encodeURIComponent(company.name)}`} className="btn-primary btn-sm">
                          写点评
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!search && companies.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 13 }}>
                共 {companies.length} 家企业
              </div>
            )}
          </>
        )}
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
