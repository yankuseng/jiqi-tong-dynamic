import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'

async function getCompanies() {
  const supabase = createServerClient()
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .order('热度指数', { ascending: false })
    .limit(20)
  
  return companies || []
}

export default async function HomePage() {
  const companies = await getCompanies()

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <Link href="/" className="logo">
            <div className="logo-icon">济</div>
            <div className="logo-text">济企通</div>
          </Link>
          <nav className="nav">
            <Link href="/" className="active">首页</Link>
            <Link href="/companies">企业列表</Link>
            <Link href="/submit">投稿</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <h1>济企通</h1>
        <p className="subtitle">济南求职避坑指南 | 让求职者少踩坑，让好企业被看见</p>
        <div className="search-box">
          <input type="text" placeholder="搜索企业名称..." />
          <button>搜索</button>
        </div>
      </section>

      <section className="stats-bar">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="number">{companies.length}+</div>
            <div className="label">收录企业</div>
          </div>
          <div className="stat-item">
            <div className="number">5000+</div>
            <div className="label">真实点评</div>
          </div>
          <div className="stat-item">
            <div className="number">100%</div>
            <div className="label">免费查看</div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">🔥 热门企业</h2>
        <div className="companies-grid">
          {companies.map((company: any) => (
            <Link key={company.id} href={`/companies/${company.id}`} className="company-card">
              <div className="company-header">
                <h3 className="company-name">{company.name}</h3>
                <span className="company-posts">{company.industry}</span>
              </div>
              {company.location && <p className="company-business">{company.location}</p>}
            </Link>
          ))}
        </div>
        <div className="more-link">
          <Link href="/companies">查看全部 {companies.length} 家企业 →</Link>
        </div>
      </section>

      <section className="section" id="contribute">
        <div className="contribute-section">
          <h3>📝 帮助更多人避坑</h3>
          <p>你在济南工作过哪些公司？分享你的真实经历，让求职者少走弯路。</p>
          <Link href="/submit" className="contribute-btn">
            <span>立即投稿</span>
          </Link>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>关于济企通</h4>
            <p>济企通是济南本地企业点评平台，致力于为求职者提供真实、客观的企业评价信息。</p>
          </div>
          <div className="footer-section">
            <h4>免责说明</h4>
            <p>本站所有内容均来自用户分享，仅供参考。求职前请多方核实。</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 济企通 JiqiTong.com | 济南求职避坑指南</p>
        </div>
      </footer>
    </div>
  )
}
