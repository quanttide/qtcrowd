import { Link } from "react-router-dom";

export default function Take() {
  return (
    <div className="page take-page">
      <Link to="/" className="back-link">&larr; 首页</Link>
      <h1>接单</h1>

      <section className="section">
        <h2>为什么在量潮众包接单</h2>
        <p>
          标准即契约：任务标准、交付标准、验收标准公开可验证——你的交付质量由标准说话，
          不被好评刷分左右。高频小额交易沉淀标准执行率，信用记录是你的核心资产。
        </p>
        <p>
          达标者导流进入量潮数据（qtdata）认证供应商池，承接科研数据高价值订单——
          认证闸门不放开，但一旦达标，qtdata 直接读取你在众包市场积累的信用资产。
        </p>
      </section>

      <section className="section">
        <h2>接单流程</h2>
        <ol>
          <li>注册执行方身份，建立信用档案</li>
          <li>浏览可接的标准任务，按能力选择接单</li>
          <li>按量潮标准交付，验收准则兜底</li>
          <li>验收通过后沉淀信用记录与标准执行率</li>
          <li>标准执行率达标的执行方进入 qtdata 认证供应商池</li>
        </ol>
      </section>

      <section className="section">
        <h2>平台原则</h2>
        <div className="principle-item">
          <div className="principle-title">不做低价悬赏</div>
          <p className="principle-desc">
            悬赏模式天然鼓励劣质供给，与标准交易自相矛盾。价格在标准内竞价，不向下竞。
          </p>
        </div>
        <div className="principle-item">
          <div className="principle-title">通用市场自由注册</div>
          <p className="principle-desc">
            众包通用层可自由注册接单；进入 qtdata 认证池必须经过标准筛选，闸门不放开。
          </p>
        </div>
        <div className="principle-item">
          <div className="principle-title">复现即成熟</div>
          <p className="principle-desc">
            平台沉淀可复用的标准任务库与案例库，每个项目标准化、复现，平台越用越强。
          </p>
        </div>
      </section>

      <section className="section">
        <h2>当前状态</h2>
        <p className="contact-note">
          平台尚未上线。当前以试验田方式在第三方众包平台外发任务，
          验证供应商获取与标准任务拆解；qtcrowd 上线后自用订单迁入竞价。
        </p>
      </section>
    </div>
  );
}
