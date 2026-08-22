import { Link } from "react-router-dom";
import { tasks } from "../data/tasks";

// 联系信息：GitHub 为真实链接；邮件为占位，待补充后启用
const contacts = [
  { label: "GitHub", value: "github.com/quanttide", href: "https://github.com/quanttide" },
  { label: "邮件", value: "待补充", href: "" },
];

export default function Home() {
  return (
    <div className="page home">
      <section className="hero">
        <h1 className="hero-tagline">
          量潮众包：标准交易市场。<br />
          我们不判断谁好谁坏，我们验证谁的产品符合标准。
        </h1>
        <p className="hero-anchor">需求拆解为标准任务 · 执行方按量潮标准交付 · 验收准则兜底</p>
      </section>

      <section className="section">
        <h2>交易方式</h2>
        <div className="entry-grid">
          <div className="entry-card">
            <h3>需求方发单</h3>
            <p>把需求拆解为标准任务，明确交付标准与验收准则，发布进入市场竞价。</p>
            <Link to="/post">发单流程 &rarr;</Link>
          </div>
          <div className="entry-card">
            <h3>执行方接单</h3>
            <p>注册执行方身份，浏览标准任务，按量潮标准交付并沉淀信用记录。</p>
            <Link to="/take">接单流程 &rarr;</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>标准任务</h2>
        {tasks.map(task => (
          <div className="service-item" key={task.slug}>
            <span className="service-type">{task.type}</span>
            <span className="service-title">{task.title}</span>
            <p className="service-desc">{task.scenario}</p>
          </div>
        ))}
      </section>

      <section className="section">
        <h2>与量潮数据的协同</h2>
        <p>
          众包市场承担筛选功能：执行方在通用市场按量潮标准交易、积累信用，
          标准执行率达标的执行方导流进入量潮数据（qtdata）认证供应商池，
          承接科研数据高价值订单。筛选是导流的闸门，闸门不放开。
        </p>
      </section>

      <section className="section">
        <h2>联系</h2>
        <div className="contact-list">
          {contacts.map(contact => (
            <div className="contact-item" key={contact.label}>
              <span className="contact-label">{contact.label}</span>
              {contact.href ? (
                <a href={contact.href} target="_blank" rel="noopener noreferrer">
                  {contact.value}
                </a>
              ) : (
                <span className="contact-placeholder">{contact.value}</span>
              )}
            </div>
          ))}
        </div>
        <p className="contact-note">
          平台尚未上线，当前以试验田方式在第三方众包平台外发任务，验证供应商获取与标准任务拆解。
        </p>
      </section>
    </div>
  );
}
