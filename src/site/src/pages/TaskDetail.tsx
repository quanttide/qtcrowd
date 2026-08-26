import { Link, useParams } from "react-router-dom";
import { STATUS_AVAILABILITY } from "../data/tasks";
import type { PublishedTask } from "../data/publicTasks";
import { useTaskCatalog } from "../hooks/useTaskCatalog";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "../data/site";

/** 结构化段落（背景 / 内容 / 输入 / 交付物 / 报酬 / 报名等）；空列表不渲染。 */
function Section({
  title,
  items,
  ordered = false,
}: {
  title: string;
  items: string[] | undefined;
  ordered?: boolean;
}) {
  if (!items || items.length === 0) return null;
  const Tag = ordered ? "ol" : "ul";
  return (
    <section className="section">
      <h2>{title}</h2>
      <Tag>
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </Tag>
    </section>
  );
}

function ReferenceSection({ task }: { task: PublishedTask }) {
  if (!task.reference || task.reference.length === 0) return null;
  return (
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
  );
}

export default function TaskDetail() {
  const { name } = useParams();
  const { state, reload } = useTaskCatalog();

  if (state.status === "loading") {
    return (
      <div className="page task-page">
        <Link to="/" className="back-link">&larr; 首页</Link>
        <h1>任务加载中…</h1>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="page task-page">
        <Link to="/" className="back-link">&larr; 首页</Link>
        <h1>任务数据源加载失败</h1>
        <p className="contact-note">{state.message}</p>
        <button type="button" onClick={() => void reload()}>
          重试
        </button>
      </div>
    );
  }

  const task = state.tasks.find(t => t.id === name);
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
        {[task.business, task.category].filter(Boolean).join(" · ")}
        {task.status ? ` · ${task.status}（${STATUS_AVAILABILITY[task.status]}）` : ""}
      </p>

      <Section title="任务背景" items={task.background} />
      <Section title="任务内容" items={task.content} ordered />
      <Section title="任务输入" items={task.input} />
      <ReferenceSection task={task} />
      <Section title="交付物" items={task.deliverables} />
      <Section title="报酬" items={task.reward} />
      <Section title="其他" items={task.others} />

      {task.deadline && (
        <section className="section">
          <h2>截止日期</h2>
          <p>{task.deadline}</p>
        </section>
      )}

      <Section title="如何报名" items={task.applyGuide} ordered />
      {task.applyGuide && task.applyGuide.length > 0 && (
        <section className="section">
          <h2>报名入口</h2>
          <p>
            <a href={CONTACT_MAILTO}>{CONTACT_EMAIL}</a>
          </p>
        </section>
      )}
    </div>
  );
}
