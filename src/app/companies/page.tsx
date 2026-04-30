import Link from 'next/link'
import { supabase } from '@/lib/supabase'

async function getCompanies(search?: string) {
  let query = supabase
    .from('companies')
    .select('*')
    .order('posts_count', { ascending: false })
  
  if (search) {
    query = query.ilike('name', `%${search}%`)
  }
  
  const { data: companies } = await query.limit(100)
  return companies || []
}

export default async function CompaniesPage({
  searchParams
}: {
  searchParams: { search?: string }
}) {
  const search = searchParams.search
  const companies = await getCompanies(search)

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

      <section className="page-header">
        <div className="container">
          <h1>济南企业列表</h1>
          <p>共 {companies.length} 家企业 | 数据来源：用户真实讨论</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="filter-bar">
            <form method="get" action="/companies" className="search-box" style={{ flex: 1 }}>
              <input 
                type="text" 
                name="search" 
                placeholder="搜索企业名称..." 
                defaultValue={search}
              />
              <button type="submit">搜索</button>
            </form>
          </div>

          <div className="companies-grid" style={{ marginTop: 24 }}>
            {companies.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
                未找到相关企业
              </p>
            ) : (
              companies.map((company: any) => (
                <Link key={company.id} href={`/companies/${company.id}`} className="company-card">
                  <div className="company-header">
                    <h3 className="company-name">{company.name}</h3>
                    <span className="company-posts">{company.posts_count}条讨论</span>
                  </div>
                  {company.business && <p className="company-business">{company.business}</p>}
                  <div className="company-tags">
                    {company.has_overtime && <span className="tag tag-warning">有加班讨论</span>}
                    {company.has_salary && <span className="tag tag-info">有薪资讨论</span>}
                  </div>
                  {company.summary && (
                    <p className="company-summary">{company.summary.substring(0, 80)}...</p>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
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
