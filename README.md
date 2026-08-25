# qtcrowd

量潮众包：量潮科技自营发销售众包，面向外部渠道与代理，按量潮标准结算。

站点只做信息展示，不是交易平台。

## 代码

| 路径 | 说明 |
|------|------|
| `src/site` | 众包官网（React 19 + Vite，见 [site README](./src/site/README.md)） |
| `src/studio` | 参与人员端工作室（Flutter Web，任务认领 + 结算，见 [studio README](./src/studio/README.md)） |

## 开发

```bash
cd src/site && npm install && npm run dev
cd src/studio && flutter pub get && flutter run
```

## 构建

```bash
cd src/site && npm run build
cd src/studio && flutter build web
```
