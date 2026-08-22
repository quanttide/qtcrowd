# Changelog

## 2026-08-22

### site/v0.1.1-alpha.2（黄页版）

- 精简为**单页黄页**：一页目录 + 联系，去路由与导航。
- 首页：定位一行 +「可接任务」目录（渠道拓展/线索获取/代理销售/推广投放/客户回访）+ 联系。
- 删除 `/post`、`/take` 漏斗页与「你能得到什么/怎么开始/怎么相信」营销段落。
- 已上线 crowd.quanttide.com

### site/v0.1.1-alpha.1（接单人优先版）

- 站点以**接单人为中心**重构：Hero 改为面向接单人的价值主张
- 新增「你能得到什么」：按结果付酬 / 标准公开 / 持续有单
- 任务清单改为「你可以接这些活」；新增「怎么相信」（结算保障）
- 导航改为：首页 / 任务清单 / 成为伙伴
- 已上线 crowd.quanttide.com

### site/v0.1.0（初始发布）

- 初始化 src/site：Vite + React 19 + TS 脚手架
- 首页：Hero + 发单说明 + 可接任务清单 + 参与方式 + 联系
- 发单页 `/post`：量潮科技自营发销售众包；参与页 `/take`：谁能参与 / 如何参与 / 平台原则
- 数据：`src/data/tasks.ts` 销售众包任务类型清单（渠道拓展 / 线索获取 / 代理销售 / 推广投放 / 客户回访）
- 上线配置：`deploy-site.yml` + `manifests/terraform`（qtcrowd-site / CDN crowd.quanttide.com / DNS CNAME / 证书 / SPA 回退）
- 上线 crowd.quanttide.com
