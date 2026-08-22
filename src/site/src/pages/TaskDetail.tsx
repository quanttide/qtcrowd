import { Link, useParams } from "react-router-dom";
import { tasks } from "../data/tasks";

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
      <p className="detail-meta">{task.business}</p>

      <section className="section">
        <h2>任务说明</h2>
        <p>{task.description}</p>
      </section>

      <section className="section">
        <h2>具体信息</h2>
        <ul>
          {task.detail.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>结算</h2>
        <p>{task.settlement}</p>
      </section>

      <section className="section">
        <h2>联系</h2>
        <p>
          <a href="mailto:hr@quanttide.com">hr@quanttide.com</a>
        </p>
      </section>
    </div>
  );
}
