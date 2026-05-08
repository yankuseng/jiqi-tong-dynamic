import Link from 'next/link'

export default async function AdminAppealsPage() {
  const appeals = [
    {
      id: 1,
      company: '浪潮集团',
      quotedReview: '工资发放不及时，经常拖欠两个月以上，管理层态度恶劣。',
      reason: '该评价与事实不符，我司工资发放正常，希望删除此恶意差评。',
      status: '待处理',
      time: '2小时前',
    },
    {
      id: 2,
      company: '齐鲁制药',
      quotedReview: '加班没有加班费，强制周末开会，违反劳动法。',
      reason: '我司严格遵守劳动法，加班均有调休或加班费，请核实后删除不实评价。',
      status: '已处理',
      time: '5小时前',
    },
    {
      id: 3,
      company: '高新控股',
      quotedReview: '面试过程不公平，存在性别歧视。',
      reason: '我司面试流程规范，不存在任何歧视行为，此评价严重损害公司形象。',
      status: '已驳回',
      time: '昨天',
    },
  ]

  const tabs = ['全部', '待处理', '已处理', '已驳回']

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
          <Link href="/admin/appeals" className="admin-nav-item active">
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
        <h1 className="admin-page-title">申诉处理</h1>

        <div className="admin-tabs">
          {tabs.map((tab, i) => (
            <button key={i} className={`admin-tab ${i === 0 ? 'active' : ''}`}>
              {tab}
            </button>
          ))}
        </div>

        {appeals.map((appeal) => (
          <div key={appeal.id} className="appeal-card">
            <div className="appeal-header">
              <span className="appeal-company">{appeal.company}</span>
              <div className="appeal-actions">
                <span className={`status-badge ${appeal.status === '待处理' ? 'pending' : appeal.status === '已处理' ? 'approved' : 'rejected'}`}>
                  {appeal.status}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--fg-muted)' }}>{appeal.time}</span>
              </div>
            </div>
            <div className="appeal-quote">引用点评：{appeal.quotedReview}</div>
            <div style={{ fontSize: '14px', marginBottom: '12px' }}>
              <strong>申诉理由：</strong>{appeal.reason}
            </div>
            {appeal.status === '待处理' && (
              <div className="appeal-actions">
                <button className="btn btn-primary" style={{ padding: '8px 16px' }}>通过</button>
                <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>驳回</button>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  )
}