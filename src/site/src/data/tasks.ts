// 销售众包可接任务黄页清单
// 量潮科技自营发销售众包：面向外部渠道与代理，按量潮标准结算。
export interface Task {
  name: string;        // 业务线标识（qtdata / qtclass / qtconsult）
  title: string;       // 显示标题
  description: string; // 描述（含结算）
}

export const tasks: Task[] = [
  {
    name: "qtdata",
    title: "量潮数据",
    description: "为量潮数据产品拓展客户线索、代理销售与推广，按有效线索与成交结果结算。",
  },
  {
    name: "qtclass",
    title: "量潮课堂",
    description: "为量潮课堂课程拓展学员线索、代理销售与推广，按有效线索与成交结果结算。",
  },
  {
    name: "qtconsult",
    title: "量潮咨询",
    description: "为量潮咨询服务拓展客户线索、代理销售与推广，按有效线索与成交结果结算。",
  },
];
