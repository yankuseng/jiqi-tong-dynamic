import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'

interface PageProps {
  params: { id: string }
}

async function getCompany(id: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', Number(id))
    .single()
  
  if (error || !data) {
    return null
  }
  return data
}

async function getReviews(companyId: number) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('company_id', companyId)
    .neq('content', '')
    .order('created_at', { ascending: false })
    .limit(20)
  
  if (error || !data) {
    return []
  }
  return data
}

export default async function CompanyPage({ params }: PageProps) {
  const company = await getCompany(params.id)
  
  if (!company) {
    notFound()
  }

  const reviews = await getReviews(company.id)

  return (
    <div className="page-wrapper">
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

      <section className="company-header">
        <div className="container">
          <Link href="/companies" className="back-link">← 返回企业列表</Link>
          <h1 className="company-name">{company.name}</h1>
          <div className="company-badges">
            {company.location && <span className="badge">{company.location}</span>}
            {company.industry && <span className="badge">{company.industry}</span>}
          </div>
          {company.summary && <p className="company-summary">{company.summary}</p>}
          {company.tags && company.tags.length > 0 && (
            <div className="company-tags">
              {company.tags.map((tag: string, index: number) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="detail-content">
        <div className="container">
          <div className="detail-grid">
            <div className="detail-main">
              <div className="card">
                <h3>最新点评</h3>
                {reviews.length === 0 ? (
                  <p className="empty-text">暂无点评，成为第一个分享者</p>
                ) : (
                  <div className="review-list">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="review-card">
                        <div className="review-header">
                          <span className="review-date">
                            {new Date(review.created_at).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <p className="review-content">{review.content}</p>
                        {review.overtime && (
                          <p className="review-meta">⏰ 加班情况：{review.overtime}</p>
                        )}
                        {review.salary && (
                          <p className="review-meta">💰 薪资情况：{review.salary}</p>
                        )}
                      </div>
                    ))}
                  </div>
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
            </div>
          </div>
        </div>
      </section>

      <div className="fixed-bottom">
        <div className="container">
          <Link href={`/submit?company=${encodeURIComponent(company.name)}`} className="cta-button">
            写点评
          </Link>
        </div>
      </div>

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