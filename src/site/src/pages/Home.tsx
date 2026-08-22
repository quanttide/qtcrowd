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
        <p className="hero-anchor">把课程研发拆成小任务，学员即生产 · 课堂 → 众包 → 招聘</p>
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
        <h2>众包链条</h2>
        <p>
          课堂 → 众包 → 招聘：众包给学员提供参与机会，让他们获得信用和收益；
          众包积累的信用又帮助他们参与招聘。接单人就是学员，学习即生产。
        </p>
        <p className="contact-note">
          不做低价悬赏：小单是标准任务，不是悬赏——把需求分解成明确具体的小任务，
          用充分竞争换取低价和高质量。
        </p>
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
