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
          量潮科技把销售工作众包出去。<br />
          面向外部渠道与代理，按量潮标准结算。
        </h1>
        <p className="hero-anchor">销售众包 · 渠道/代理合作 · 站点仅作说明展示</p>
      </section>

      <section className="section">
        <h2>量潮科技在发什么样的销售众包</h2>
        <p>量潮科技作为需求方，把销售相关工作拆解、发包给外部渠道与代理完成，按交付与成交结果结算。</p>
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
        <h2>怎么参与</h2>
        <div className="entry-grid">
          <div className="entry-card">
            <h3>我是渠道 / 代理</h3>
            <p>按量潮标准承接销售任务，按交付与成交结果结算。</p>
            <Link to="/take">参与方式 &rarr;</Link>
          </div>
          <div className="entry-card">
            <h3>有合作意向</h3>
            <p>联系量潮科技，洽谈销售众包的任务类型与结算方式。</p>
            <Link to="/post">发单说明 &rarr;</Link>
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
          站点仅作信息展示；如需接单或洽谈合作，请通过上述方式联系。
        </p>
      </section>
    </div>
  );
}
