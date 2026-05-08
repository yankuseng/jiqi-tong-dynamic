import Link from 'next/link'

export default async function AdminReviewsPage() {
  const reviews = [
    {
      id: 1,
      company: '浪潮集团',
      user: '张**',
      rating: 5,
      content: '公司氛围很好，技术团队专业，福利待遇也不错。',
      status: '已发布',
      time: '2024-01-15',
    },
    {
      id: 2,
      company: '齐鲁制药',
      user: '李**',
      rating: 3,
      content: '管理比较严格，加班比较多，但薪资还行。',
      status: '待审核',
      time: '2024-01-14',
    },
    {
      id: 3,
      company: '中国重汽',
      user: '王**',
      rating: 4,
      content: '老牌国企，稳定可靠，晋升空间有待提高。',
      status: '已发布',
      time: '2024-01-13',
    },
  ]

  const tabs = ['全部', '待审核', '已发布', '已删除']

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <Link href="/admin" className="logo">
            济企通<span style={{ color: 'var(--accent)' }}>.</span>
          </Link>
          <span className="admin-tag">管理后台</span>
        </div>
        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-item">
            📊 数据概览
          </Link>
          <Link href="/admin/companies" className="admin-nav-item">
            🏢 企业管理
          </Link>
          <Link href="/admin/appeals" className="admin-nav-item">
            ⚠️ 申诉处理
          </Link>
          <Link href="/admin/reviews" className="admin-nav-item active">
            📝 点评管理
          </Link>
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/">退出登录</Link>
        </div>
      </aside>

      <main className="admin-content">
        <h1 className="admin-page-title">点评管理</h1>

        <div className="admin-search">
          <input type="text" placeholder="搜索点评内容..." />
          <div className="admin-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
            {tabs.map((tab, i) => (
              <button key={i} className={`admin-tab ${i === 0 ? 'active' : ''}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>企业</th>
                <th>用户</th>
                <th>评分</th>
                <th>点评内容</th>
                <th>状态</th>
                <th>时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td style={{ fontWeight: 600 }}>{review.company}</td>
                  <td>{review.user}</td>
                  <td style={{ color: '#F59E0B' }}>{'★'.repeat(review.rating)}</td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {review.content}
                  </td>
                  <td>
                    <span className={`status-badge ${review.status === '已发布' ? 'approved' : 'pending'}`}>
                      {review.status}
                    </span>
                  </td>
                  <td>{review.time}</td>
                  <td>
                    <span className="action-link">查看</span>
                    {review.status === '待审核' && (
                      <>
                        <span className="action-link">通过</span>
                        <span className="action-link">删除</span>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button>上一页</button>
          <button className="active">1</button>
          <button>2</button>
          <button>下一页</button>
        </div>
      </main>
    </div>
  )
}