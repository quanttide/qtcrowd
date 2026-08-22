// 销售众包可接任务黄页清单
// 量潮科技自营发销售众包：面向外部渠道与代理，按量潮标准结算。
// 以「任务/项目」为单元组织（来源：quanttide-brochure-of-business-entity）。
export interface Task {
  name: string;        // 唯一任务标识（做 key）
  title: string;       // 任务/项目名
  description: string; // 任务说明（含结算）
}

export const tasks: Task[] = [
  {
    name: "qtdata-data",
    title: "量潮数据 · 科研数据清洗/精炼",
    description: "为高校经管科研团队提供数据清洗/精炼，把问卷、工序、产量等杂数据整理成可分析格式；获客并促成项目订单，按有效线索与成交结算。",
  },
  {
    name: "qtclass-vibe",
    title: "量潮课堂 · Vibe Coding 一对一",
    description: "为开发者提供 Vibe Coding 一对一课程（参考 1000 元/时、在校学生 500），招募学员；按课时结算。",
  },
  {
    name: "qtclass-practice",
    title: "量潮课堂 · 大数据实践课/生产实习",
    description: "为高校提供《大数据实践课》《生产实习》校企合作课程，招生或促成校企合作；按课程与学员结算。",
  },
  {
    name: "qtconsult",
    title: "量潮咨询 · 企业/创始人咨询",
    description: "为中小企业与创始人提供创新/创业咨询（AI 原生组织转型、创始人边界等）；获客并促成，按服务周期结算（参考企业 2000、个体 1000）。",
  },
];
