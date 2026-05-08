import Link from 'next/link'

export default async function AdminCompaniesPage() {
  const companies = [
    { id: 1, name: '浪潮集团', industry: '信息技术', employees: '10000+', rating: 4.8, reviews: 42, status: '已认证' },
    { id: 2, name: '齐鲁制药', industry: '生物医药', employees: '5000+', rating: 4.5, reviews: 28, status: '已认证' },
    { id: 3, name: '高新控股', industry: '科技投资', employees: '2000+', rating: 4.2, reviews: 15, status: '待认证' },
    { id: 4, name: '中国重汽', industry: '装备制造', employees: '8000+', rating: 4.6, reviews: 36, status: '已认证' },
    { id: 5, name: '山东电力', industry: '能源', employees: '12000+', rating: 4.7, reviews: 51, status: '已认证' },
  ]

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
          <Link href="/admin/companies" className="admin-nav-item active">
            🏢 企业管理
          </Link>
          <Link href="/admin/appeals" className="admin-nav-item">
            ⚠️ 申诉处理
          </Link>
          <Link href="/admin/reviews" className="admin-nav-item">
            📝 点评管理
          </Link>
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/">退出登录</Link>
        </div>
      </aside>

      <main className="admin-content">
        <h1 className="admin-page-title">企业管理</h1>

        <div className="admin-search">
          <input type="text" placeholder="搜索企业名称..." />
          <div className="filters">
            <button className="filter-pill active">全部</button>
            <button className="filter-pill">已认证</button>
            <button className="filter-pill">待认证</button>
          </div>
          <button className="btn btn-primary btn-add">添加企业</button>
        </div>

        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>企业名称</th>
                <th>行业</th>
                <th>员工规模</th>
                <th>评分</th>
                <th>点评数</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td style={{ fontWeight: 600 }}>{company.name}</td>
                  <td>{company.industry}</td>
                  <td>{company.employees}</td>
                  <td>{company.rating}</td>
                  <td>{company.reviews}</td>
                  <td>
                    <span className={`status-badge ${company.status === '已认证' ? 'approved' : 'pending'}`}>
                      {company.status}
                    </span>
                  </td>
                  <td>
                    <Link href={`/companies/${company.id}`} className="action-link">查看</Link>
                    <span className="action-link">编辑</span>
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
          <button>3</button>
          <button>下一页</button>
        </div>
      </main>
    </div>
  )
}