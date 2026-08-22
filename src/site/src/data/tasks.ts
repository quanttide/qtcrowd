// 标准任务类型静态清单
// 定位核对自 data/intention/qtcrowd（众包工作意图）
export type TaskType = "数据" | "开发" | "设计" | "写作" | "咨询";

export interface Task {
  slug: string;
  title: string;
  type: TaskType;
  scenario: string;
  standard: string;
}

export const tasks: Task[] = [
  {
    slug: "data",
    title: "数据处理",
    type: "数据",
    scenario: "原始数据加工为可靠、可用的结构化数据，全程可复现、可审计。",
    standard: "按量潮标准交付：处理逻辑、参数与中间结果公开可验证。",
  },
  {
    slug: "dev",
    title: "开发实现",
    type: "开发",
    scenario: "按规格书实现功能模块，验收准则兜底。",
    standard: "标准任务拆解：需求拆解为可验收的任务粒度，交付物与验收准则明确。",
  },
  {
    slug: "design",
    title: "交互设计",
    type: "设计",
    scenario: "界面布局与交互流程设计，产出可评审的设计文档。",
    standard: "按交互设计文档标准交付：设计原则、核心界面、交互流程齐全。",
  },
  {
    slug: "writing",
    title: "内容写作",
    type: "写作",
    scenario: "按内容标准完成写作交付，风格与结构可控。",
    standard: "按写作管理标准交付：主题、结构、风格符合任务契约。",
  },
  {
    slug: "consult",
    title: "专业咨询",
    type: "咨询",
    scenario: "按任务范围提供专业判断与建议，产出结论性文档。",
    standard: "结论可验证：依据、推理过程与建议一并交付。",
  },
];
