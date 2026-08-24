// 站点共享常量（单文件导出）：联系信息与结算口径。
// Home 与 TaskDetail 统一从这里取，不再各自硬编码，避免漂移。

/** 联系邮箱（真实接单入口：报名 / 咨询） */
export const CONTACT_EMAIL = "crowd@quanttide.com";

/** 联系邮箱 mailto 链接 */
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;

/** 联系信息展示项（首页「联系」区块） */
export const CONTACT_ITEMS = [
  { label: "邮箱", value: CONTACT_EMAIL, href: CONTACT_MAILTO },
];

/**
 * 结算与竞价口径（站点全局口径，非任务数据）。
 * 每个任务的明码标价由任务数据（task.reward）渲染，这里只放站点级竞价原则，
 * 避免与任务数据重复。
 */
export const SETTLEMENT_POLICY = [
  "谈条件竞价：接单人可自报价或谈条件，充分竞争换取低价和高质量。",
];
