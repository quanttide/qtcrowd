import { Link } from "react-router-dom";
import { tasks } from "../data/tasks";

export default function Post() {
  return (
    <div className="page post-page">
      <Link to="/" className="back-link">&larr; 首页</Link>
      <h1>发单</h1>

      <section className="section">
        <h2>为什么在量潮众包发单</h2>
        <p>
          标准交易市场，不是任务撮合市场：需求被拆解为标准任务，执行方按量潮标准交付，
          验收准则兜底——你不必判断执行方好坏，只需验证交付物是否符合标准。
        </p>
        <p>
          标准内竞价：谁以更优性价比符合标准谁得单。平台靠信用沉淀掌握定价权，
          需求有价格，整体价格更低。
        </p>
      </section>

      <section className="section">
        <h2>发单流程</h2>
        <ol>
          <li>拆解需求为标准任务，写明交付物与验收准则（可参考标准任务库的既有模板）</li>
          <li>设置任务竞价参数：预算、工期、验收标准</li>
          <li>发布任务进入市场竞价</li>
          <li>查看执行方的信用记录与标准执行率，辅助选单</li>
          <li>按验收准则验收，不达标的要求返工</li>
        </ol>
      </section>

      <section className="section">
        <h2>标准任务类型</h2>
        {tasks.map(task => (
          <div className="service-item" key={task.slug}>
            <span className="service-type">{task.type}</span>
            <span className="service-title">{task.title}</span>
            <p className="service-desc">{task.scenario}</p>
            <p className="service-pricing">{task.standard}</p>
          </div>
        ))}
        <p className="contact-note">
          任务拆解需要技术主管以上的判断：需求能否拆到任务粒度，是平台运转的前提。
        </p>
      </section>
    </div>
  );
}
