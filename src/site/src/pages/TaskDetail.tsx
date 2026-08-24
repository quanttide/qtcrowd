import { Link, useParams } from "react-router-dom";
import { tasks, STATUS_AVAILABILITY } from "../data/tasks";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "../data/site";

export default function TaskDetail() {
  const { name } = useParams();
  const task = tasks.find(t => t.name === name);

  if (!task) {
    return (
      <div className="page task-page">
        <Link to="/" className="back-link">&larr; 首页</Link>
        <h1>未找到该任务</h1>
        <p className="contact-note">请回首页查看可接任务。</p>
      </div>
    );
  }

  return (
    <div className="page task-page">
      <Link to="/" className="back-link">&larr; 首页</Link>
      <h1>{task.title}</h1>
      <p className="detail-meta">
        {task.business} · {task.category} · {task.status}（{STATUS_AVAILABILITY[task.status]}）
      </p>

      <section className="section">
        <h2>任务背景</h2>
        {task.background.map(paragraph => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <section className="section">
        <h2>任务内容</h2>
        <ol>
          {task.content.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="section">
        <h2>任务输入</h2>
        <ul>
          {task.input.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>参考链接</h2>
        <ul>
          {task.reference.map(item => (
            <li key={item.url ?? item.label}>
              {item.url ? <a href={item.url}>{item.label}</a> : item.label}
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>交付物</h2>
        <ul>
          {task.deliverables.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>报酬</h2>
        <ul>
          {task.reward.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>其他</h2>
        <ul>
          {task.others.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>如何报名</h2>
        <ol>
          {task.applyGuide.map(step => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p>
          报名入口：<a href={CONTACT_MAILTO}>{CONTACT_EMAIL}</a>
        </p>
      </section>
    </div>
  );
}
