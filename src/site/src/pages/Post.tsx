import { Link } from "react-router-dom";
import { tasks } from "../data/tasks";

export default function Post() {
  return (
    <div className="page post-page">
      <Link to="/" className="back-link">&larr; 首页</Link>
      <h1>发单说明</h1>

      <section className="section">
        <h2>谁是需求方</h2>
        <p>目前由量潮科技自己发单：把销售相关工作拆解、发包给外部渠道与代理完成。</p>
      </section>

      <section className="section">
        <h2>结算方式</h2>
        <ul>
          <li>按交付结果结算：渠道、线索、成交等结果明确、可验收。</li>
          <li>按量潮标准验收，不达标照标准处理。</li>
        </ul>
      </section>

      <section className="section">
        <h2>当前发布的销售众包</h2>
        {tasks.map(task => (
          <div className="service-item" key={task.slug}>
            <span className="service-type">{task.type}</span>
            <span className="service-title">{task.title}</span>
            <p className="service-desc">{task.scenario}</p>
            <p className="service-pricing">{task.standard}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
