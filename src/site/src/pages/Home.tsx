import { Link } from "react-router-dom";
import { tasks, STATUS_AVAILABILITY } from "../data/tasks";
import { CONTACT_ITEMS } from "../data/site";

export default function Home() {
  return (
    <div className="page home">
      <section className="hero">
        <h1 className="hero-tagline">量潮众包</h1>
        <p className="hero-anchor">把内部流程整理为可复用的插件与配置，众包给外部完成</p>
      </section>

      <section className="section">
        <h2>可接任务</h2>
        <div className="task-grid">
          {tasks.map(task => (
            <Link to={`/tasks/${task.name}`} className="task-card" key={task.name}>
              <div className="task-card-head">
                <span className="task-card-title">{task.title}</span>
                <span className="status-tag">{STATUS_AVAILABILITY[task.status]}</span>
              </div>
              <p className="task-card-desc">{task.description}</p>
              <p className="task-card-meta">{task.business} · {task.category} · {task.status}</p>
              <p className="task-card-reward">{task.reward[0]}</p>
            </Link>
          ))}
        </div>
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
