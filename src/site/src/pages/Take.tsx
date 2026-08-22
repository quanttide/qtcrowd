import { Link } from "react-router-dom";

export default function Take() {
  return (
    <div className="page take-page">
      <Link to="/" className="back-link">&larr; 首页</Link>
      <h1>成为量潮的销售接单伙伴</h1>

      <section className="section">
        <h2>你能得到什么</h2>
        <ul>
          <li>按结果付酬：渠道、线索、成交，干多少拿多少（分佣 / 单价面议，以合作契约为准）</li>
          <li>标准公开：任务、交付、验收、结算标准公开可验证，照标准拿钱</li>
          <li>持续有单：达标者可长期合作，跟着量潮的销售盘子长期做</li>
        </ul>
      </section>

      <section className="section">
        <h2>你要做什么</h2>
        <ol>
          <li>承接销售任务：渠道拓展、线索获取、代理销售、推广投放、客户回访等（见首页清单）</li>
          <li>按量潮标准交付：任务标准、交付标准、验收标准公开，照标准执行</li>
          <li>按结果结算：交付与成交结果明确，验收后按契约拿钱</li>
        </ol>
      </section>

      <section className="section">
        <h2>怎么开始</h2>
        <ol>
          <li>联系量潮科技，洽谈可承接的任务类型与范围</li>
          <li>明确交付与结算标准，按标准执行</li>
          <li>按交付结果验收与结算</li>
        </ol>
      </section>

      <section className="section">
        <h2>怎么相信</h2>
        <div className="principle-item">
          <div className="principle-title">结果导向</div>
          <p className="principle-desc">按交付与成交结果结算，不按过程投入付费。</p>
        </div>
        <div className="principle-item">
          <div className="principle-title">标准公开</div>
          <p className="principle-desc">任务、交付、验收标准公开可验证，照标准结算。</p>
        </div>
        <div className="principle-item">
          <div className="principle-title">结算保障</div>
          <p className="principle-desc">验收通过后按契约结算；具体付款节点与分佣以合作契约为准。</p>
        </div>
      </section>
    </div>
  );
}
