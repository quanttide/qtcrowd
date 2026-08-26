import { Link } from "react-router-dom";
import { STATUS_AVAILABILITY } from "../data/tasks";
import type { PublishedTask } from "../data/publicTasks";
import { useTaskCatalog } from "../hooks/useTaskCatalog";
import { CONTACT_ITEMS } from "../data/site";

/** 可接性标签：公开层任务均为 published（无 status 字段）→ 显示「可接」；
 * tasks.json 兜底按档案状态显示。 */
function availability(task: PublishedTask): string {
  return task.status ? STATUS_AVAILABILITY[task.status] : "可接";
}

function taskMeta(task: PublishedTask): string {
  return [task.business, task.category].filter(Boolean).join(" · ");
}

export default function Home() {
  const { state, reload } = useTaskCatalog();

  return (
    <div className="page home">
      <section className="hero">
        <h1 className="hero-tagline">量潮众包</h1>
        <p className="hero-anchor">把内部流程整理为可复用的插件与配置，众包给外部完成</p>
      </section>

      <section className="section">
        <h2>可接任务</h2>
        {state.status === "loading" && <p className="catalog-note">任务加载中…</p>}

        {state.status === "error" && (
          <div className="catalog-error" role="alert">
            <p>任务数据源加载失败，请稍后重试或联系量潮。</p>
            <p className="catalog-error-detail">{state.message}</p>
            <button type="button" onClick={() => void reload()}>
              重试
            </button>
          </div>
        )}

        {state.status === "ready" &&
          (state.tasks.length === 0 ? (
            <p className="catalog-note">当前没有可接任务，敬请期待。</p>
          ) : (
            <div className="task-grid">
              {state.tasks.map(task => (
                <Link to={`/tasks/${task.id}`} className="task-card" key={task.id}>
                  <div className="task-card-head">
                    <span className="task-card-title">{task.title}</span>
                    <span className="status-tag">{availability(task)}</span>
                  </div>
                  <p className="task-card-desc">{task.description}</p>
                  {taskMeta(task) && <p className="task-card-meta">{taskMeta(task)}</p>}
                  {task.reward[0] && <p className="task-card-reward">{task.reward[0]}</p>}
                </Link>
              ))}
            </div>
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
