import Link from 'next/link'

export default function TermsPage() {
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

      <section className="form-section">
        <div className="form-card" style={{ maxWidth: 720, margin: '0 auto' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>用户服务协议与社区准则</h1>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>一、用户服务协议</h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 14 }}>
              <p style={{ marginBottom: 12 }}>
                <strong>1. 服务说明</strong><br />
                济企通（jiqitong.com）是济南企业点评平台，旨在帮助求职者了解真实的公司情况。用户在使用本平台服务时，应遵守以下协议。
              </p>
              <p style={{ marginBottom: 12 }}>
                <strong>2. 用户承诺</strong><br />
                用户承诺在使用本平台时：<br />
                · 发布的点评内容必须基于真实工作经历<br />
                · 不得发布虚假、捏造或夸大事实的内容<br />
                · 不得泄露企业或个人的隐私信息（包括但不限于手机号、详细地址、照片）<br />
                · 不得发布侮辱、诽谤、诋毁企业的内容<br />
                · 不得发布涉及政治敏感、违法违规的内容<br />
                · 如因内容不实导致法律纠纷，由发布者自行承担法律责任
              </p>
              <p style={{ marginBottom: 12 }}>
                <strong>3. 内容真实性保证</strong><br />
                用户发布点评时，默认勾选"我承诺以上内容真实有效，基于本人真实工作经历"，该承诺作为用户在平台的电子签名，具有法律效力。
              </p>
              <p style={{ marginBottom: 12 }}>
                <strong>4. 平台免责</strong><br />
                济企通仅为信息聚合平台，不对用户发布的内容真实性负责。用户因依赖平台信息而做出的任何决定，由用户自行承担后果。平台在接到合法侵权通知后，会在24小时内删除相应内容。
              </p>
              <p>
                <strong>5. 知识产权</strong><br />
                用户发布的点评内容版权归发布者所有，但用户授权济企通免费使用、传播这些内容。
              </p>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>二、社区准则</h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 14 }}>
              <p style={{ marginBottom: 12 }}>
                <strong>鼓励发布的内容</strong><br />
                · 基于真实经历的工作体验分享<br />
                · 客观描述公司氛围、加班情况、薪资待遇<br />
                · 对求职者有参考价值的实用信息<br />
                · 具体的数据和事实（如"月薪8000，13薪"）
              </p>
              <p style={{ marginBottom: 12 }}>
                <strong>禁止发布的内容</strong><br />
                · 虚假指控（如"老板欠薪跑路"等无证据内容）<br />
                · 直接侮辱或谩骂（如"XX公司是垃圾"）<br />
                · 泄露隐私（手机号、详细地址、员工照片等）<br />
                · 竞争对手恶意抹黑<br />
                · 政治敏感内容<br />
                · 色情、赌博等违法违规内容
              </p>
              <p>
                <strong>违规处理</strong><br />
                违反本准则的内容将被删除，情节严重者将被禁止使用本平台。涉及违法的内容，平台将配合相关部门调查。
              </p>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>三、企业申诉规则</h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 14 }}>
              <p style={{ marginBottom: 12 }}>
                如果您认为平台上的内容侵犯了您的合法权益，可以通过以下方式提交申诉：
              </p>
              <p>
                · 访问 <Link href="/report" style={{ color: 'var(--primary-color)' }}>企业申诉页面</Link> 提交申诉<br />
                · 平台将在 72 小时内处理您的申诉<br />
                · 提供充分证据的内容（如不实信息、隐私泄露），将在核实后立即删除<br />
                · 企业有权在对应点评下方发表公开回应
              </p>
            </div>
          </div>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              最后更新日期：2026年5月
            </p>
          </div>
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
