// 销售众包可接任务黄页清单
// 量潮科技自营发销售众包：面向外部渠道与代理，按量潮标准结算。
export interface Task {
  slug: string;
  title: string;    // 业务线 / 产品
  scenario: string; // 可接的销售动作
  standard: string; // 按什么结算
}

export const tasks: Task[] = [
  {
    slug: "data",
    title: "量潮数据",
    scenario: "为量潮数据产品拓展客户线索、代理销售与推广。",
    standard: "按有效线索与成交结果结算。",
  },
  {
    slug: "course",
    title: "量潮课堂",
    scenario: "为量潮课堂课程拓展学员线索、代理销售与推广。",
    standard: "按有效线索与成交结果结算。",
  },
  {
    slug: "consult",
    title: "量潮咨询",
    scenario: "为量潮咨询服务拓展客户线索、代理销售与推广。",
    standard: "按有效线索与成交结果结算。",
  },
];
