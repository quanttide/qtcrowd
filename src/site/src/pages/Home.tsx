import { Link } from "react-router-dom";
import { tasks } from "../data/tasks";

// 联系信息：招聘邮箱
const contacts = [
  { label: "邮箱", value: "hr@quanttide.com", href: "mailto:hr@quanttide.com" },
];

export default function Home() {
  return (
    <div className="page home">
      <section className="hero">
        <h1 className="hero-tagline">量潮众包</h1>
        <p className="hero-anchor">把内部流程整理为可复用的插件与配置，众包给外部完成</p>
      </section>

      <section className="section">
        <h2>可接任务</h2>
        {tasks.map(task => (
          <Link to={`/tasks/${task.name}`} className="service-item" key={task.name}>
            <span className="service-title">{task.title}</span>
            <p className="service-desc">{task.description}</p>
          </Link>
        ))}
      </section>

      <section className="section">
        <h2>任务来源</h2>
        <p>
          量潮自供需求：把内部有价值但精力不足的流程（如「第二大脑上下文创建对话」）
          拆成明确具体的小任务放出来，由众包完成；小单是标准任务，不是低价悬赏。
        </p>
        <p className="contact-note">
          不做低价悬赏：把需求分解成明确具体的小任务，用充分竞争换取低价和高质量。
        </p>
      </section>

      <section className="section">
        <h2>结算与竞价</h2>
        <ul>
          <li>报酬：按任务档案明码标价（如 1000 元代金券，可兑换 CEO 2 小时课程），也可自报价最终协商。</li>
          <li>谈条件竞价：接单人可自报价或谈条件，充分竞争换取低价和高质量。</li>
        </ul>
      </section>

      <section className="section">
        <h2>联系</h2>
        <div className="contact-list">
          {contacts.map(contact => (
            <div className="contact-item" key={contact.label}>
              <span className="contact-label">{contact.label}</span>
              <a href={contact.href}>{contact.value}</a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
