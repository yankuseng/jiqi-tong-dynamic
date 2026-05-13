import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              济企通<span className="footer-dot">.</span>
            </div>
            <p className="footer-desc">
              济南本地企业点评平台，致力于为求职者提供真实、客观的企业评价信息。
            </p>
          </div>
          <div className="footer-nav-group">
            <h4 className="footer-nav-title">关于济企通</h4>
            <Link href="/" className="footer-nav-link">首页</Link>
            <Link href="/companies" className="footer-nav-link">企业列表</Link>
            <Link href="/submit" className="footer-nav-link">投稿入口</Link>
          </div>
          <div className="footer-nav-group">
            <h4 className="footer-nav-title">帮助与支持</h4>
            <Link href="/terms" className="footer-nav-link">用户协议</Link>
            <Link href="/report" className="footer-nav-link">企业申诉</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 济企通 <a href="http://jiqitong.com/" target="_blank" rel="noopener noreferrer">JiqiTong.com</a> | 济南求职避坑指南 | <Link href="/terms">用户协议</Link> | <Link href="/report">企业申诉</Link></p>
        </div>
      </div>
    </footer>
  )
}
