# Flash Arena

Solana 上的实时交易竞技场。

Flash Arena 是为 Solana Blitz v5 设计的交易竞赛应用。玩家进入限时交易回合，使用模拟资金开多或开空，并根据实时 PnL 排行。项目目标是用 MagicBlock Ephemeral Rollups 展示低延迟、接近实时的链上交易体验，同时避免真实资金交易带来的风险和复杂度。

## 项目概念

Flash Arena 采用“真实行情 + 模拟交易资金”的方式：

- 行情价格使用真实市场数据，让体验更像真实交易。
- 账户余额和仓位使用模拟数据，方便测试和演示。
- MagicBlock Ephemeral Rollups 可用于处理实时竞技场状态、回合结算和排行榜更新。
- Solana 钱包可用于玩家身份和签名操作，但初始版本不需要真实交易资金。

## 核心体验

1. 玩家连接钱包并加入交易竞技场。
2. 当前回合获得模拟 USDC。
3. 选择交易市场，开多或开空。
4. 实时查看 PnL 变化。
5. 在回合结束前平仓。
6. 根据已实现和未实现 PnL 进入排行榜。
7. 回合结束后结算最终成绩。

## 数据策略

Flash Arena 建议使用混合数据方案：

- 市场价格：使用 Flash Trade、Pyth、Jupiter 或其他可靠公共价格 API 的真实行情。
- 余额和仓位：使用模拟数据。
- 竞技场状态：使用 devnet 或 MagicBlock Ephemeral Rollup 状态。
- 真实资金：初始版本不需要接入。

这样既能符合交易主题，又能控制开发风险，适合短周期 hackathon。

## 当前功能

- Arena Command Center 桌面界面
- 移动端 Trade / Positions / Leaderboard / Activity tabs
- 钱包玩家身份与 demo fallback 模式
- 每个玩家的模拟 USDC 余额
- 多空仓位模拟器
- Market / Limit / Stop 订单流程
- 可见的条件单队列和取消操作
- 可交互市场筛选、市场规则、图表周期、K 线 / 折线模式
- 真实行情优先，失败时自动 fallback 模拟行情
- 实时 PnL 计算
- 限时交易回合
- 手动和自动回合结算
- 当前玩家高亮的竞技场排行榜
- 可展开排行榜、可筛选 Recent trades 交易流和 ER settlement log
- RPC 健康状态展示
- 浏览器本地持久化：demo 持仓、订单、交易和结算历史刷新后可恢复
- PWA metadata、favicon 和移动端主题色
- Cloudflare Pages 部署准备

## 技术方向

技术栈：

- 前端：React、Vite、TypeScript
- 样式：自定义响应式 CSS
- 区块链网络：Solana devnet
- 实时执行层：MagicBlock Ephemeral Rollups
- 行情数据：公共实时价格源 + fallback 模拟行情
- 部署：Cloudflare Pages
- 可选后端：Cloudflare Workers，用于 API 代理、限流和轻量持久化
- 可选存储：Cloudflare D1、KV 或 Durable Objects

第一版优先保证 demo 完整可玩，而不是追求复杂的真实交易基础设施。

## 本地开发

```bash
npm install
npm run dev
```

构建检查：

```bash
npm run build
```

生产构建 smoke check：

```bash
npm run smoke
```

提交前完整验证：

```bash
npm run verify
```

部署到 Cloudflare Pages：

```bash
npm run deploy
```

## 部署方案

推荐部署方式：

1. 将公开项目仓库推送到 GitHub。
2. 在 Cloudflare Pages 绑定该仓库。
3. main 分支自动部署前端。
4. RPC endpoint 和 API 配置放在 Cloudflare 环境变量中。
5. 只有在需要 API 代理或共享状态持久化时，再增加 Cloudflare Worker。

初始 hackathon 版本不需要传统服务器。

## 安全与隐私

Flash Arena 初始版本不应要求用户使用真实资金。

公开仓库中不应包含：

- 私钥或助记词
- 个人本地机器路径
- 私人笔记或内部工作流记录
- API 密钥
- 不必要的个人信息

环境相关配置应放在部署平台的环境变量中，不应提交到仓库。

## Hackathon 提交内容

一个完整的提交应包括：

- 公开 GitHub 仓库
- 在线 demo 链接
- 简短演示视频
- 清晰的 README
- 公开的 P1-P6 需求和验收门槛
- MagicBlock Ephemeral Rollups 的使用说明
- 为什么使用模拟余额而不使用真实资金的说明

有用的项目文档：

- [需求列表](./REQUIREMENTS.zh-CN.md)
- [提交材料](./SUBMISSION.md)
- [部署说明](./DEPLOYMENT.md)

## 当前状态

可玩 demo 实现。
