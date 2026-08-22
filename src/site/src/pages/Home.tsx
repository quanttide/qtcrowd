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
          你来把产品卖出去，量潮按结果付你钱。
        </h1>
        <p className="hero-anchor">销售众包 · 渠道 / 代理合作 · 按交付与成交结果结算</p>
      </section>

      <section className="section">
        <h2>你能得到什么</h2>
        <ul>
          <li>按结果付酬：渠道、线索、成交，干多少拿多少（分佣 / 单价面议，以合作契约为准）</li>
          <li>标准公开：任务、交付、验收、结算标准公开可验证，照标准拿钱</li>
          <li>持续有单：达标者可长期合作，跟着量潮的销售盘子长期做</li>
        </ul>
      </section>

      <section className="section">
        <h2>你可以接这些活</h2>
        <p>量潮科技自营发销售众包，任务按量潮标准拆解。以下为当前常见类型。</p>
        {tasks.map(task => (
          <div className="service-item" key={task.slug}>
            <span className="service-type">{task.type}</span>
            <span className="service-title">{task.title}</span>
            <p className="service-desc">{task.scenario}</p>
            <p className="service-pricing">{task.standard}</p>
          </div>
        ))}
      </section>

      <section className="section">
        <h2>怎么开始</h2>
        <div className="entry-grid">
          <div className="entry-card">
            <h3>我是渠道 / 代理</h3>
            <p>看看成为接单伙伴要做什么、怎么结算、怎么相信。</p>
            <Link to="/take">成为接单伙伴 &rarr;</Link>
          </div>
          <div className="entry-card">
            <h3>量潮在发什么</h3>
            <p>了解需求方与当前发布的销售众包任务清单。</p>
            <Link to="/post">看任务清单 &rarr;</Link>
          </div>
        </div>
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
          站点仅作信息展示；如需接单或洽谈合作，请通过上述方式联系量潮科技。
        </p>
      </section>
    </div>
  );
}
