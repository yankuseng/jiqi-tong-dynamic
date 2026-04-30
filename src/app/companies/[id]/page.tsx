import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface PageProps {
  params: { id: string }
}

async function getCompany(id: string) {
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', parseInt(id))
    .single()
  
  return company
}

async function getCompanyReviews(companyId: number) {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(20)
  
  return reviews || []
}

export default async function CompanyPage({ params }: PageProps) {
  const company = await getCompany(params.id)
  
  if (!company) {
    notFound()
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
          <h1>{company.name}</h1>
          <div className="detail-meta">
            {company.address && <span className="meta-item">📍 {company.address}</span>}
            {company.business && <span className="meta-item">💼 {company.business}</span>}
            <span className="meta-item">💬 {company.posts_count}条讨论</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="detail-grid">
            <div className="detail-main">
              {company.summary && (
                <div className="detail-card">
                  <h3>💬 点评摘要</h3>
                  <p className="summary-text">{company.summary}</p>
                </div>
              )}

              {company.overtime && (
                <div className="detail-card">
                  <h3>⏰ 加班情况</h3>
                  <p className="overtime-text">{company.overtime}</p>
                </div>
              )}

              <div className="detail-card">
                <h3>💡 求职建议</h3>
                <ul className="advice-list">
                  <li>{company.has_salary ? '✅ 有用户分享过薪资信息' : '❓ 暂无薪资信息，建议面试时询问'}</li>
                  <li>{company.has_overtime ? '✅ 有用户讨论过加班情况' : '❓ 暂无加班讨论，建议多方打听'}</li>
                  <li>🔍 建议通过多个渠道核实信息</li>
                </ul>
              </div>

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
                  {company.address && (
                    <div className="info-item">
                      <span className="info-label">地址</span>
                      <span className="info-value">{company.address}</span>
                    </div>
                  )}
                  {company.business && (
                    <div className="info-item">
                      <span className="info-label">主营业务</span>
                      <span className="info-value">{company.business}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <span className="info-label">数据来源</span>
                    <span className="info-value">{company.posts_count}条用户讨论</span>
                  </div>
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
