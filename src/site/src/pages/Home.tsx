import { tasks } from "../data/tasks";

// 联系信息：招聘邮箱
const contacts = [
  { label: "邮箱", value: "hr@quanttide.com", href: "mailto:hr@quanttide.com" },
];

export default function Home() {
  return (
    <div className="page home">
      <section className="hero">
        <h1 className="hero-tagline">量潮科技 · 销售众包</h1>
        <p className="hero-anchor">当前可接任务黄页，按量潮标准结算。</p>
      </section>

      <section className="section">
        <h2>可接任务</h2>
        {tasks.map(task => (
          <div className="service-item" key={task.slug}>
            <span className="service-title">{task.title}</span>
            <p className="service-desc">{task.scenario}</p>
            <p className="service-pricing">{task.standard}</p>
          </div>
        ))}
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
      </section>
    </div>
  );
}
