// 销售众包任务类型静态清单
// 量潮科技自营发销售众包：面向外部渠道与代理，按量潮标准结算。
export type TaskType = "渠道拓展" | "线索获取" | "代理销售" | "推广投放" | "客户回访";

export interface Task {
  slug: string;
  title: string;
  type: TaskType;
  scenario: string;
  standard: string;
}

export const tasks: Task[] = [
  {
    slug: "channel",
    title: "渠道拓展",
    type: "渠道拓展",
    scenario: "为量潮产品拓展合作渠道与代理资源。",
    standard: "按有效渠道与代理的数量、质量结算。",
  },
  {
    slug: "leads",
    title: "线索获取",
    type: "线索获取",
    scenario: "获取有意向的客户线索，交由量潮科技跟进。",
    standard: "按有效线索数量与转化阶段结算。",
  },
  {
    slug: "agent",
    title: "代理销售",
    type: "代理销售",
    scenario: "以代理身份按量潮标准销售产品，完成签约与成交。",
    standard: "按成交结果与量潮标准结算。",
  },
  {
    slug: "promotion",
    title: "推广投放",
    type: "推广投放",
    scenario: "按指定渠道投放推广物料，获取曝光与转化。",
    standard: "按投放执行与效果指标结算。",
  },
  {
    slug: "followup",
    title: "客户回访",
    type: "客户回访",
    scenario: "按标准对已成交或潜在客户进行回访与维护。",
    standard: "按回访执行与反馈质量结算。",
  },
];
