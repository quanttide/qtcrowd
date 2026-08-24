import { Link } from "react-router-dom";
import { tasks, groupTasksByStatus, STATUS_AVAILABILITY } from "../data/tasks";
import { CONTACT_ITEMS, SETTLEMENT_POLICY } from "../data/site";

export default function Home() {
  const groups = groupTasksByStatus(tasks);

  return (
    <div className="page home">
      <section className="hero">
        <h1 className="hero-tagline">量潮众包</h1>
        <p className="hero-anchor">把内部流程整理为可复用的插件与配置，众包给外部完成</p>
      </section>

      <section className="section">
        <h2>可接任务</h2>
        {groups.map(group => (
          <div className="task-group" key={group.status}>
            <h3 className="task-group-title">
              {group.status}
              <span className="status-tag">{STATUS_AVAILABILITY[group.status]}</span>
            </h3>
            {group.tasks.map(task => (
              <Link to={`/tasks/${task.name}`} className="service-item" key={task.name}>
                <span className="service-title">{task.title}</span>
                <p className="service-desc">{task.description}</p>
              </Link>
            ))}
          </div>
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
        {tasks.map(task => (
          <div className="settlement-item" key={task.name}>
            <h3 className="settlement-title">{task.title}</h3>
            <ul>
              {task.reward.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
        {SETTLEMENT_POLICY.map(line => (
          <p className="contact-note" key={line}>{line}</p>
        ))}
      </section>

      <section className="section">
        <h2>联系</h2>
        <div className="contact-list">
          {CONTACT_ITEMS.map(contact => (
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
