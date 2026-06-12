# Flash Arena 需求列表

本文档定义 hackathon 版本的公开产品范围。目标是完成一个可直接演示和使用的交易竞技场，用接近 Solana 实时交易的体验展示产品能力，但不要求用户使用真实资金。

## 默认产品决策

- 交易资金：只使用模拟 USDC。
- 行情数据：优先使用公共实时价格，失败时切换到确定性 fallback 模拟行情。
- 钱包：Solana 钱包用于身份；没有钱包时进入 demo mode。
- 执行层：MagicBlock Ephemeral Rollups 作为实时竞技场状态层的设计方向。
- 网络：Solana devnet 或 MagicBlock 兼容测试 endpoint。
- 部署：Cloudflare Pages。
- 后端：首版不强依赖后端；只有需要共享持久化或 API 代理时再增加 Cloudflare Workers。

## P1：可玩的竞技场基础

要做什么：

- 首屏就是交易竞技场，不做营销落地页。
- 当前回合状态，包括倒计时、live 状态和 reset。
- 模拟 USDC 余额、equity、PnL 和排名。
- BTC、ETH、SOL、JUP、BONK 等 perpetual-style 市场选择。
- 桌面端和移动端响应式布局。

怎么做：

- 使用 React、Vite、TypeScript。
- 为了 demo 安全，竞技场状态先放在本地。
- 用浏览器存储保存 demo 状态，刷新后不丢失当前回合。

最终完成什么：

- 用户打开应用后，能立刻看到当前回合、选择市场、查看模拟余额和排名。

## P2：交易和风控

要做什么：

- 做多和做空交易流程。
- Market、Limit、Stop 三类订单。
- 保证金输入、快捷比例、杠杆控制。
- 预估仓位规模、手续费和爆仓价。
- 平仓流程和 realized PnL。
- 可见的条件单队列，并支持取消。

怎么做：

- 按当前市场价格模拟成交。
- 根据行情更新触发 limit / stop 订单。
- 拒绝超过可用模拟余额的订单。
- 所有余额和订单金额都明确标注为 demo funds。

最终完成什么：

- 用户可以开仓、监控、平仓、排队、触发和取消 demo 交易，全程不需要真实资金。

## P3：行情和图表

要做什么：

- 公共实时价格更新。
- 实时行情延迟或不可用时自动 fallback 到模拟行情。
- K 线风格图表和市场统计。
- 行情状态指示。

怎么做：

- 定时请求公共价格数据。
- 将实时价格合并到本地市场 candles。
- 当行情源失败时，本地继续演化价格，保证 demo 可用。

最终完成什么：

- 无论公共价格 API 正常、延迟还是不可用，竞技场都能继续使用。

## P4：竞赛层

要做什么：

- 排行榜，并高亮当前用户。
- 预置 demo 竞争者，增强演示可信度。
- Recent trades 交易流。
- 回合结算动作。
- 最终 PnL 和排行榜快照事件。

怎么做：

- 用 realized PnL、unrealized PnL 和 open positions 计算 equity。
- 按 equity 排序 competitors。
- 将用户动作写入 recent trades 和 settlement logs。

最终完成什么：

- 用户交易后，可以看到排名、活动流和最终回合结果在应用内更新。

## P5：Solana 和 MagicBlock 叙事

要做什么：

- Solana 钱包连接流程，用于玩家身份。
- 没有钱包时有清晰 demo fallback。
- 使用可配置 devnet 或 MagicBlock 兼容 endpoint 做 RPC health check。
- ER settlement log 展示交易接受、批处理、状态更新和回合结算。

怎么做：

- 从部署环境读取 `VITE_MAGICBLOCK_RPC_URL`。
- 默认使用 Solana devnet 做公开 health check。
- 首版不接入真实交易和资产托管。

最终完成什么：

- 提交材料可以清楚说明 MagicBlock Ephemeral Rollups 的位置：快速竞技场状态、订单接受、结算日志和排行榜快照。

## P6：交付、QA 和提交

要做什么：

- 英文 README。
- 中文 README。
- 部署说明。
- 提交检查清单。
- 生产构建 smoke check。
- Cloudflare Pages 配置。

怎么做：

- 公开文档只说明产品、安装、部署、安全和提交内容。
- 不把私钥、助记词、本地机器路径、私人笔记或 API secrets 放入仓库。
- 使用 Cloudflare Pages 作为在线 demo。

最终完成什么：

- 项目有公开 GitHub 仓库，本地检查通过，生产构建通过，并在授权部署后拥有在线 demo 链接。

## 验收门槛

- `npm run check` 通过。
- `npm run build` 通过。
- `npm run smoke` 通过。
- 桌面端 1440 x 1024 可用。
- 移动端 390 x 844 可用。
- 不需要真实资金。
- 仓库不包含私钥、助记词、API secrets、个人本地路径或私人笔记。
- 公开 GitHub 仓库可访问。
- Hackathon 最终提交前，Cloudflare Pages 在线 demo 可访问。
