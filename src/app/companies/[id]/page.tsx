import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'

interface PageProps {
  params: { id: string }
}

async function getCompany(id: string) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', Number(id))
      .single()
    
    if (error) {
      console.error('getCompany error:', error)
      return null
    }
    return data
  } catch (e) {
    console.error('getCompany exception:', e)
    return null
  }
}

async function getCompanyReviews(companyId: number) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) {
      console.error('getCompanyReviews error:', error)
      return []
    }
    return data || []
  } catch (e) {
    console.error('getCompanyReviews exception:', e)
    return []
  }
}

export default async function CompanyPage({ params }: PageProps) {
  const company = await getCompany(params.id)
  
  if (!company) {
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
              <Link href="/companies">企业列表</Link>
              <Link href="/submit">投稿</Link>
            </nav>
          </div>
        </header>
        <section className="page-header">
          <div className="container">
            <h1>企业未找到</h1>
            <p>该企业可能不存在或已被删除</p>
            <Link href="/companies" className="back-link">← 返回企业列表</Link>
          </div>
        </section>
      </div>
    )
  }
  
  const reviews = await getCompanyReviews(company.id)

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
            <Link href="/companies">企业列表</Link>
            <Link href="/submit">投稿</Link>
          </nav>
        </div>
      </header>

      <section className="page-header">
        <div className="container">
          <Link href="/companies" className="back-link">← 返回企业列表</Link>
          <h1>{company.name || '未知企业'}</h1>
          <div className="detail-meta">
            {company.location && <span className="meta-item">📍 {company.location}</span>}
            {company.industry && <span className="meta-item">💼 {company.industry}</span>}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="detail-grid">
            <div className="detail-main">
              <div className="detail-card">
                <h3>📖 最新点评</h3>
                {reviews.length === 0 ? (
                  <p className="empty-text">暂无点评，成为第一个分享者</p>
                ) : (
                  reviews.map((review: any) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <span className="review-date">
                          {new Date(review.created_at).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <p className="review-content">{review.content}</p>
                      {review.overtime && (
                        <p className="review-meta">⏰ 加班情况：{review.overtime}</p>
                      )}
                      {review.salary_range && (
                        <p className="review-meta">💰 薪资情况：{review.salary_range}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="detail-sidebar">
              <div className="sidebar-card">
                <h4>基本信息</h4>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">企业名称</span>
                    <span className="info-value">{company.name}</span>
                  </div>
                  {company.location && (
                    <div className="info-item">
                      <span className="info-label">所在城市</span>
                      <span className="info-value">{company.location}</span>
                    </div>
                  )}
                  {company.industry && (
                    <div className="info-item">
                      <span className="info-label">所属行业</span>
                      <span className="info-value">{company.industry}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="sidebar-card">
                <h4>📝 补充信息</h4>
                <p style={{ marginBottom: 12, color: 'var(--text-secondary)' }}>
                  你在这家公司工作过吗？分享你的真实经历
                </p>
                <Link href={`/submit?company=${encodeURIComponent(company.name)}`} className="contribute-btn" style={{ display: 'block', textAlign: 'center' }}>
                  写点评
                </Link>
              </div>
            </div>
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
