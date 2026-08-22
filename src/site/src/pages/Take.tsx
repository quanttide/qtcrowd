import { Link } from "react-router-dom";

export default function Take() {
  return (
    <div className="page take-page">
      <Link to="/" className="back-link">&larr; 首页</Link>
      <h1>参与方式</h1>

      <section className="section">
        <h2>谁能参与</h2>
        <p>面向外部渠道与代理：愿意按量潮标准承接销售任务、按结果结算的团队与个人。</p>
      </section>

      <section className="section">
        <h2>如何参与</h2>
        <ol>
          <li>联系量潮科技，洽谈可承接的销售任务类型与范围。</li>
          <li>明确交付与结算标准，按标准执行。</li>
          <li>按交付结果验收与结算。</li>
        </ol>
      </section>

      <section className="section">
        <h2>平台原则</h2>
        <div className="principle-item">
          <div className="principle-title">结果导向</div>
          <p className="principle-desc">按交付与成交结果结算，不按过程投入付费。</p>
        </div>
        <div className="principle-item">
          <div className="principle-title">标准公开</div>
          <p className="principle-desc">任务、交付、验收标准公开可验证，照标准结算。</p>
        </div>
      </section>
    </div>
  );
}
