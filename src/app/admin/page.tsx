import Link from 'next/link'

export default async function AdminDashboard() {
  const stats = [
    { label: '企业总数', num: '574', sub: '+12 本月新增' },
    { label: '点评总数', num: '204', sub: '+8 本月新增' },
    { label: '待审申诉', num: '5', sub: '需处理' },
    { label: '待审点评', num: '12', sub: '需审核' },
  ]

  const recentAppeals = [
    { id: 1, company: '浪潮集团', reason: '信息不实申请删除', status: '待处理', time: '2小时前' },
    { id: 2, company: '齐鲁制药', reason: '竞争对手恶意差评', status: '已处理', time: '5小时前' },
    { id: 3, company: '高新控股', reason: '评价与事实不符', status: '已驳回', time: '昨天' },
  ]

  const timeline = [
    { title: '新增企业：山东电力', time: '10分钟前', type: 'company' },
    { title: '新增点评：对中国重汽的5星评价', time: '30分钟前', type: 'review' },
    { title: '申诉处理：齐鲁制药', time: '2小时前', type: 'appeal' },
    { title: '企业更新：浪潮集团', time: '昨天', type: 'company' },
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
          <Link href="/admin" className="admin-nav-item active">
            📊 数据概览
          </Link>
          <Link href="/admin/companies" className="admin-nav-item">
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
        <h1 className="admin-page-title">数据概览</h1>

        <div className="stats-cards">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="label">{stat.label}</div>
              <div className="num">{stat.num}</div>
              <div className="sub">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>最近申诉</th>
                <th>申诉原因</th>
                <th>状态</th>
                <th>时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {recentAppeals.map((appeal) => (
                <tr key={appeal.id}>
                  <td>{appeal.company}</td>
                  <td>{appeal.reason}</td>
                  <td>
                    <span className={`status-badge ${appeal.status === '待处理' ? 'pending' : appeal.status === '已处理' ? 'approved' : 'rejected'}`}>
                      {appeal.status}
                    </span>
                  </td>
                  <td>{appeal.time}</td>
                  <td>
                    <Link href="/admin/appeals" className="action-link">查看</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="timeline">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>最近动态</h3>
          {timeline.map((item, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>{item.title}</h4>
              </div>
              <span className="timeline-time">{item.time}</span>
            </div>
          ))}
        </div>

        <div className="action-btns" style={{ marginTop: '24px' }}>
          <Link href="/admin/companies" className="btn btn-primary">企业管理</Link>
          <Link href="/admin/appeals" className="btn btn-secondary">处理申诉</Link>
        </div>
      </main>
    </div>
  )
}