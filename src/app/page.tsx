import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'

async function getCompanies() {
  const supabase = createServerClient()
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .not('industry', 'is', null)
    .neq('industry', '')
    .order('posts_count', { ascending: false })
    .limit(20)

  return companies || []
}

export default async function HomePage() {
  const companies = await getCompanies()

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <Link href="/" className="logo">
              济企通<span style={{ color: 'var(--accent)' }}>.</span>
            </Link>
            <nav className="nav">
              <Link href="/">首页</Link>
              <Link href="/companies">企业列表</Link>
            </nav>
            <Link href="/submit" className="btn btn-primary">
              立即投稿
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container">
          <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 700, marginBottom: 16 }}>
            在济南，找工作前先看这条点评
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.125rem', marginBottom: 32 }}>
            济南本地企业点评平台 · 让求职者少踩坑 · 让好企业被看见
          </p>
          <form action="/companies" method="get" className="search-form">
            <input
              type="text"
              name="search"
              placeholder="搜索企业名称..."
              style={{ flex: 1, padding: '12px 20px', borderRadius: 8, border: 'none', fontSize: 16 }}
            />
            <button type="submit" style={{ padding: '12px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>
              搜索
            </button>
          </form>
          <div className="hot-tags" style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: 20, color: '#fff', fontSize: 14 }}>互联网</span>
            <span style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: 20, color: '#fff', fontSize: 14 }}>金融</span>
            <span style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: 20, color: '#fff', fontSize: 14 }}>教育培训</span>
            <span style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: 20, color: '#fff', fontSize: 14 }}>制造业</span>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>574+</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>收录企业</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>204+</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>真实点评</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>1000+</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>帮助求职者</div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Discussions */}
      <section className="section">
        <div className="container">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 24 }}>🔥 活跃讨论</h2>
          <div className="companies-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {companies.map((company: any) => (
              <Link key={company.id} href={`/companies/${company.id}`} className="company-card">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 8 }}>{company.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 4 }}>
                  {company.location && <span>{company.location}</span>}
                  {company.location && company.industry && <span> · </span>}
                  {company.industry && <span>{company.industry}</span>}
                </p>
                {company.summary && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {company.summary}
                  </p>
                )}
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    {company.posts_count || 0} 条讨论
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--primary)', padding: '48px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600, marginBottom: 16 }}>
            你有踩坑经历吗？分享出来帮大家避坑
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 24 }}>
            匿名投稿，保护你的隐私，让更多求职者受益
          </p>
          <Link href="/submit" style={{ display: 'inline-block', padding: '12px 32px', background: 'var(--accent)', color: '#fff', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>
            立即投稿
          </Link>
        </div>
      </section>

      {/* Footer */}
          </div>
  )
}
