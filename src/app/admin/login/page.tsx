import Link from 'next/link'

export default async function AdminLoginPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-title">管理后台登录</div>
        <div className="form-group">
          <label>用户名</label>
          <input type="text" placeholder="请输入用户名" />
        </div>
        <div className="form-group">
          <label>密码</label>
          <input type="password" placeholder="请输入密码" />
        </div>
        <Link href="/admin" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
          登录
        </Link>
        <div className="login-back">
          <Link href="/">返回首页</Link>
        </div>
      </div>
    </div>
  )
}