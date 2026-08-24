// 众包可接任务清单
// 量潮众包：当前真实任务。数据源：data/profile/qtcloud/second-brain-init.md。
// 真实数据一律以 data/profile 为准，不自创占位/示例数据。
export interface Task {
  name: string;         // 唯一任务标识（路由参数 / key）
  title: string;        // 任务名
  description: string;  // 目录一句话
  business: string;     // 所属环节
  detail: string[];     // 详情页具体信息
  settlement: string;   // 结算 / 报价
}

export const tasks: Task[] = [
  {
    name: "second-brain-init",
    title: "第二大脑创建插件",
    description: "把「第二大脑上下文创建对话」流程接入资产云，整理为插件 / 可复用配置。",
    business: "量潮云 · 招聘考核",
    detail: [
      "理解现有对话流程与格式章程；",
      "将该流程接入资产云，整理为插件 / 可复用配置；",
      "输出一份非技术用户也能看懂的使用说明；",
      "完成一轮测试，记录结果与问题。",
      "任务输入：原始对话导出文件（报名后提供）+ 格式章程说明。",
      "参考数据：quanttide-profile-of-agent-engineering/quanttide-asset。",
    ],
    settlement: "1000 元代金券（可兑换 CEO 2 小时课程）；也可自报价，最终协商。",
  },
];
