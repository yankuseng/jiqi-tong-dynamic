import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'

async function getHomeStats() {
  const supabase = createServerClient()

  const [{ count: companiesCount }, { count: reviewsCount }] = await Promise.all([
    supabase.from('companies').select('*', { count: 'exact', head: true })
      .not('industry', 'is', null).neq('industry', ''),
    supabase.from('reviews').select('*', { count: 'exact', head: true })
      .neq('content', ''),
  ])

  return {
    companies: companiesCount || 0,
    reviews: reviewsCount || 0,
  }
}

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
  const [{ companies, reviews }, hotCompanies] = await Promise.all([
    getHomeStats(),
    getCompanies(),
  ])

  const stats = [
    { value: companies, suffix: '+', label: '收录企业', color: 'var(--primary)' },
    { value: reviews, suffix: '+', label: '真实点评', color: 'var(--accent)' },
    { value: '1000', suffix: '+', label: '帮助求职者', color: 'var(--success)' },
  ]

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

      {/* Hero - 改用原型浅灰渐变 */}
      <section className="hero">
        <div className="container">
          <h1>在济南，找工作前先看这条点评</h1>
          <p>济南本地企业点评平台 · 让求职者少踩坑 · 让好企业被看见</p>
          <form action="/companies" method="get" className="search-form">
            <input
              type="text"
              name="search"
              placeholder="搜索企业名称..."
            />
            <button type="submit">搜索</button>
          </form>
          <div className="hot-tags">
            {['互联网', '金融', '教育培训', '制造业', '建筑地产'].map(tag => (
              <Link key={tag} href={`/companies?search=${encodeURIComponent(tag)}`} className="hot-tag">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar - 实时数据 */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>
                  {stat.value}{stat.suffix}
                </div>
                <div style={{ color: 'var(--fg-muted)', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Discussions */}
      <section className="section">
        <div className="container">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 24 }}>🔥 活跃讨论</h2>
          <div className="companies-grid">
            {hotCompanies.map((company: any) => (
              <Link key={company.id} href={`/companies/${encodeURIComponent(company.name)}`} className="company-card">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 8 }}>{company.name}</h3>
                <p style={{ color: 'var(--fg-muted)', fontSize: '0.875rem', marginBottom: 4 }}>
                  {company.location && <span>{company.location}</span>}
                  {company.location && company.industry && <span> · </span>}
                  {company.industry && <span>{company.industry}</span>}
                </p>
                {company.summary && (
                  <p style={{ color: 'var(--fg-muted)', fontSize: '0.875rem', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href="/companies" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              查看全部企业 →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <h2>你有踩坑经历吗？分享出来帮大家避坑</h2>
          <p>匿名投稿，保护你的隐私，让更多求职者受益</p>
          <Link href="/submit" className="btn btn-primary">
            立即投稿
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-main">
            <div>
              <div className="footer-brand">
                济企通<span style={{ color: 'var(--accent)' }}>.</span>
              </div>
              <p style={{ color: 'var(--fg-muted)', maxWidth: 300 }}>
                济南本地企业点评平台，致力于为求职者提供真实、客观的企业评价信息。
              </p>
            </div>
            <div className="footer-links">
              <div>
                <h4>关于济企通</h4>
                <Link href="/">首页</Link>
                <Link href="/companies">企业列表</Link>
                <Link href="/submit">投稿入口</Link>
              </div>
              <div>
                <h4>帮助与支持</h4>
                <Link href="/terms">用户协议</Link>
                <Link href="/report">企业申诉</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            © 2024 济企通 JiqiTong.com | 济南求职避坑指南
          </div>
        </div>
      </footer>
    </div>
  )
}
