import Link from 'next/link'

export default async function TermsPage() {
  return (
    <div className="terms-page">
      {/* Navigation Header */}
      <header className="header">
        <div className="container">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="terms-content">
        <h1>用户服务协议与社区准则</h1>
        <p>最后更新日期：2026年5月</p>

        <section>
          <h2>一、用户服务协议</h2>
          <p><strong>1. 服务说明</strong><br />济企通（jiqitong.com）是济南企业点评平台，旨在帮助求职者了解真实的公司情况。用户在使用本平台服务时，应遵守以下协议。</p>
          <p><strong>2. 用户承诺</strong><br />用户承诺在使用本平台时：<br />· 发布的点评内容必须基于真实工作经历<br />· 不得发布虚假、捏造或夸大事实的内容<br />· 不得泄露企业或个人的隐私信息<br />· 不得发布侮辱、诽谤、诋毁企业的内容<br />· 如因内容不实导致法律纠纷，由发布者自行承担法律责任</p>
          <p><strong>3. 内容真实性保证</strong><br />用户发布点评时，默认勾选&quot;我承诺以上内容真实有效，基于本人真实工作经历&quot;，该承诺作为用户在平台的电子签名，具有法律效力。</p>
        </section>

        <section>
          <h2>二、社区准则</h2>
          <p><strong>鼓励发布的内容</strong><br />· 基于真实经历的工作体验分享<br />· 客观描述公司氛围、加班情况、薪资待遇<br />· 对求职者有参考价值的实用信息<br />· 具体的数据和事实（如&quot;月薪8000，13薪&quot;）</p>
          <p><strong>禁止发布的内容</strong><br />· 虚假指控（如&quot;老板欠薪跑路&quot;等无证据内容）<br />· 直接侮辱或谩骂（如&quot;XX公司是垃圾&quot;）<br />· 泄露隐私（手机号、详细地址、员工照片等）<br />· 竞争对手恶意抹黑</p>
          <p><strong>违规处理</strong><br />违反本准则的内容将被删除，情节严重者将被禁止使用本平台。涉及违法的内容，平台将配合相关部门调查。</p>
        </section>

        <section>
          <h2>三、企业申诉规则</h2>
          <p>如果您认为平台上的内容侵犯了您的合法权益，可以通过以下方式提交申诉：</p>
          <p>· 访问 <Link href="/report" className="link">企业申诉页面</Link> 提交申诉<br />· 平台将在 72 小时内处理您的申诉<br />· 提供充分证据的内容（如不实信息、隐私泄露），将在核实后立即删除<br />· 企业有权在对应点评下方发表公开回应</p>
        </section>

        <section>
          <h2>四、隐私保护政策</h2>
          <p><strong>1. 信息收集</strong><br />我们收集您主动提供的信息，包括但不限于：点评内容、注册信息、联系方式等，用于平台正常运营和服务提供。</p>
          <p><strong>2. 信息使用</strong><br />您的信息将用于：提供平台服务、改进产品质量、处理用户反馈、保障账户安全。我们不会将您的个人信息出售给第三方。</p>
          <p><strong>3. 信息保护</strong><br />我们采用行业标准的安全措施保护您的个人信息。但互联网传输存在固有风险，无法保证100%安全，请您理解。</p>
          <p><strong>4. Cookie使用</strong><br />我们使用Cookie技术提升用户体验，您可通过浏览器设置禁用Cookie，但这可能影响部分功能使用。</p>
        </section>

        <section>
          <h2>五、知识产权声明</h2>
          <p><strong>1. 平台内容</strong><br />济企通平台的所有内容、设计、代码及相关知识产权归平台运营方所有，受中华人民共和国知识产权法保护。</p>
          <p><strong>2. 用户内容</strong><br />用户发布的点评内容版权归发布者所有，但用户授权济企通免费使用、传播这些内容，用于平台展示、宣传等用途。</p>
          <p><strong>3. 侵权投诉</strong><br />如您认为平台内容侵犯了您的知识产权，请联系我们进行删除处理。</p>
        </section>

        <section>
          <h2>六、免责声明</h2>
          <p><strong>1. 信息准确性</strong><br />济企通仅为信息聚合平台，不对用户发布的内容真实性负责。用户因依赖平台信息而做出的任何决定，由用户自行承担后果。</p>
          <p><strong>2. 服务中断</strong><br />平台可能因系统维护、升级或不可抗力导致服务中断，平台会在合理范围内提前通知，但不承担因此造成的损失。</p>
          <p><strong>3. 第三方链接</strong><br />平台可能包含第三方链接，这些链接的隐私政策和内容由第三方负责，平台不对其负责。</p>
          <p><strong>4. 法律管辖</strong><br />本协议的解释和执行均适用中华人民共和国法律。如发生争议，双方应友好协商解决。</p>
        </section>

        <section>
          <h2>七、联系我们</h2>
          <p>如果您对本协议有任何疑问或建议，欢迎通过以下方式联系我们：</p>
          <p>· 邮箱：support@jiqitong.com<br />· 地址：山东省济南市历下区<br />· 工作时间：周一至周五 9:00-18:00</p>
          <p>我们将在收到您的反馈后尽快回复您。感谢您对济企通的支持与信任。</p>
        </section>

        <p>© 2024-2026 济企通 JiqiTong.com | 济南求职避坑指南</p>
      </main>

      {/* Site Footer */}
          </div>
  )
}
