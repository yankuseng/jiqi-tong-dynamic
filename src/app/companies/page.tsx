import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'

const ITEMS_PER_PAGE = 30

async function getCompanies(search?: string, region?: string, sort?: string, page: number = 1) {
  const supabase = createServerClient()
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  let query = supabase
    .from('companies')
    .select('*', { count: 'exact' })
    .or('industry.not.is.null,industry.neq.""')

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  if (region) {
    query = query.eq('location', region)
  }

  switch (sort) {
    case 'name':
      query = query.order('name', { ascending: true })
      break
    case 'posts':
      query = query.order('posts_count', { ascending: false })
      break
    default:
      query = query.order('posts_count', { ascending: false })
  }

  const { data: companies, count } = await query.range(from, to)
  return { companies: companies || [], total: count || 0 }
}

export default async function CompaniesPage({
  searchParams
}: {
  searchParams: { search?: string; region?: string; sort?: string; page?: string }
}) {
  const search = searchParams.search
  const region = searchParams.region
  const sort = searchParams.sort
  const currentPage = parseInt(searchParams.page || '1', 10)

  const { companies, total } = await getCompanies(search, region, sort, currentPage)
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const regions = ['历下区', '市中区', '槐荫区', '天桥区', '历城区', '高新区', '章丘区', '莱芜区']
  const sorts = [
    { value: 'posts', label: '热度排序' },
    { value: 'name', label: '名称排序' },
  ]

  const buildUrl = (params: Record<string, string | undefined>) => {
    const searchParams = new URLSearchParams()
    if (search) searchParams.set('search', search)
    if (region) searchParams.set('region', region)
    if (sort) searchParams.set('sort', sort)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, value)
    })
    return `/companies?${searchParams.toString()}`
  }

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
          <p>共 {total} 家企业 | 数据来源：用户真实讨论</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="filter-bar">
            <form method="get" action="/companies" className="search-box" style={{ flex: 1 }}>
              {region && <input type="hidden" name="region" value={region} />}
              {sort && <input type="hidden" name="sort" value={sort} />}
              <input 
                type="text" 
                name="search" 
                placeholder="搜索企业名称..." 
                defaultValue={search}
              />
              <button type="submit">搜索</button>
            </form>
          </div>

          <div className="filter-pills">
            <div className="filter-group">
              <span className="filter-label">区域：</span>
              <Link 
                href={buildUrl({ region: undefined, page: '1' })}
                className={`filter-pill ${!region ? 'active' : ''}`}
              >
                全部
              </Link>
              {regions.map(r => (
                <Link 
                  key={r}
                  href={buildUrl({ region: r, page: '1' })}
                  className={`filter-pill ${region === r ? 'active' : ''}`}
                >
                  {r}
                </Link>
              ))}
            </div>
            <div className="filter-group">
              <span className="filter-label">排序：</span>
              {sorts.map(s => (
                <Link 
                  key={s.value}
                  href={buildUrl({ sort: s.value, page: '1' })}
                  className={`filter-pill ${sort === s.value || (!sort && s.value === 'posts') ? 'active' : ''}`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="companies-grid">
            {companies.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
                未找到相关企业
              </p>
            ) : (
              companies.map((company: any) => (
                <Link key={company.id} href={`/companies/${company.id}`} className="company-card">
                  <div className="company-header">
                    <h3 className="company-name">{company.name}</h3>
                    {company.industry && <span className="company-posts">{company.industry}</span>}
                  </div>
                  {company.location && <p className="company-business">{company.location}</p>}
                </Link>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {currentPage > 1 && (
                <Link href={buildUrl({ page: String(currentPage - 1) })} className="pagination-btn">
                  上一页
                </Link>
              )}
              <span className="pagination-info">
                第 {currentPage} / {totalPages} 页
              </span>
              {currentPage < totalPages && (
                <Link href={buildUrl({ page: String(currentPage + 1) })} className="pagination-btn">
                  下一页
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-bottom">
            <p>© 2024 济企通 JiqiTong.com | 济南求职避坑指南 <span style={{ margin: '0 8px' }}>|</span> <Link href="/terms" style={{ color: 'var(--text-secondary)' }}>用户协议</Link> <span style={{ margin: '0 8px' }}>|</span> <Link href="/report" style={{ color: 'var(--text-secondary)' }}>企业申诉</Link></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
