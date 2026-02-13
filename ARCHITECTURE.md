# 📐 CryptoFlow 项目架构分析

**项目名称**: CryptoFlow - 机构级加密货币交易可视化平台  
**创建日期**: 2026年2月13日  
**文档类型**: 项目架构设计文档

---

## 📋 目录

1. [项目概述](#项目概述)
2. [整体架构](#整体架构)
3. [前端模块(SRC)](#前端模块src)
4. [后端模块(SERVER)](#后端模块server)
5. [前后端通信](#前后端通信)
6. [部署架构](#部署架构)
7. [关键职责总结](#关键职责总结)
8. [设计原理](#设计原理)

---

## 项目概述

### 🎯 核心定位

CryptoFlow 是一个**机构级加密货币交易可视化平台**，旨在复制 **Bookmap** 和 **ATAS** 等专业交易终端的功能。

### 主要特性

| 特性 | 说明 |
|------|------|
| **⚡ 高性能** | 零延迟 Canvas 渲染，处理数千根K线 |
| **🔥 热力图** | 时间对齐、伽马校正、支持滑块过滤虚假信号 |
| **🫧 3D泡泡** | 大额交易可视化为 3D 球体 |
| **🔍 足迹图** | K线内DOM / 成交量分解 |
| **📊 脚印数据** | 支持 Binance 所有交易对和时间框架 |
| **💾 数据存储** | SQLite 数据库持久化历史数据 |

### 技术栈

- **前端**: Vanilla JavaScript + HTML5 Canvas + Vite
- **后端**: Node.js + Express + SQLite
- **数据源**: Binance WebSocket / REST API
- **部署**: Windows VPS + PM2 进程管理

---

## 整体架构

### 架构模式

这是一个典型的 **前后端分离 + 数据采集系统**：

```
┌─────────────────────────────────────────┐
│  前端 (SPA - Single Page Application)    │
│  纯 Vanilla JS + Canvas 渲染            │
│  运行环境: 浏览器 (localhost:5173)      │
└─────────────────────────────────────────┘
          ↕ REST / WebSocket
┌─────────────────────────────────────────┐
│  后端 (Node.js + Express)               │
│  生产环境: Windows VPS (100.86.66.124)   │
└─────────────────────────────────────────┘
          ↕ (持续采集)
┌─────────────────────────────────────────┐
│  数据源 (Binance)                        │
└─────────────────────────────────────────┘
```

### 核心组件关系

```
Binance API (WebSocket + REST)
    ↓
┌──────────────────────────────┐
│  后端数据采集 (24/7)         │
│  ├─ collector.js             │
│  ├─ depth-collector.js       │
│  └─ ml_service.py            │
└──────────────────────────────┘
    ↓
┌──────────────────────────────┐
│  数据存储                     │
│  └─ SQLite (cryptoflow.db)    │
└──────────────────────────────┘
    ↓
┌──────────────────────────────┐
│  API 服务                     │
│  └─ api.js (REST + WebSocket) │
└──────────────────────────────┘
    ↓
┌──────────────────────────────┐
│  前端应用                     │
│  ├─ main.js                   │
│  ├─ Components (UI层)         │
│  └─ Services (业务逻辑层)     │
└──────────────────────────────┘
```

---

## 前端模块(SRC)

### 📁 目录结构

```
src/
├── main.js                    # 应用核心入口
├── index.css                  # 样式表
├── chartEngineDemo.js         # Chart演示
├── components/
│   ├── FootprintChart.js      # 足迹图组件
│   ├── VolumeProfile.js       # 成交量分布
│   ├── OrderBook.js           # 订单簿
│   ├── MLDashboard.js         # 机器学习仪表板
│   └── chart/                 # 图表核心引擎
│       ├── core/
│       │   ├── ChartState.js         # 图表状态管理
│       │   ├── CoordinateSystem.js   # 坐标系转换
│       │   ├── InputHandler.js       # 输入/交互处理
│       │   └── RenderEngine.js       # Canvas渲染器
│       └── layers/
│           ├── AnalysisLayer.js      # 分析层(泡泡、Delta等)
│           ├── CandleLayer.js        # K线层
│           ├── CrosshairLayer.js     # 十字光标层
│           ├── GridLayer.js          # 网格和坐标轴
│           └── HeatmapLayer.js       # 热力图层
└── services/
    ├── binanceWS.js           # Binance WebSocket实时数据
    ├── binanceREST.js         # Binance REST历史数据
    ├── dataAggregator.js      # 数据聚合
    ├── depthHeatmap.js        # 深度热力图计算
    ├── vpsAPI.js              # VPS后端通信
    ├── audioService.js        # 音频提示
    ├── sessionManager.js      # 会话管理
    └── settingsManager.js     # 用户设置持久化
```

### 🎯 核心模块职责

#### **main.js - 应用核心**

```javascript
class CryptoFlowApp {
    constructor() {
        // 初始化状态和配置
        this.currentSymbol = 'btcusdt';
        this.currentTimeframe = 1; // 分钟数
        
        // 初始化所有组件
        this.footprintChart = null;
        this.volumeProfile = null;
        this.orderBook = null;
        this.mlDashboard = null;
    }
    
    async initialize() {
        // 1. 连接币安 WebSocket
        // 2. 初始化UI组件
        // 3. 加载用户设置
        // 4. 启动实时更新循环
        // 5. 绑定事件监听器
    }
    
    _switchSymbol(symbol) {
        // 切换交易对时:
        // 1. 关闭旧连接
        // 2. 加载新K线数据
        // 3. 更新所有组件
        // 4. 保存用户偏好
    }
}
```

**职责**:
- ✅ 应用引导和初始化
- ✅ 生命周期管理
- ✅ 事件分发
- ✅ 组件协调

---

#### **Services（业务逻辑层）**

| 服务 | 职责 | 特点 |
|------|------|------|
| **binanceWS** | 直连币安WebSocket | - 实时市场数据<br/>- 自动重连<br/>- 事件驱动 |
| **binanceREST** | 历史数据获取 | - 分批请求<br/>- 速率限制<br/>- 错误重试 |
| **dataAggregator** | 数据融合聚合 | - 多源合并<br/>- 时间同步<br/>- K线更新 |
| **depthHeatmap** | 热力图计算 | - 深度分析<br/>- 强度计算<br/>- 伽马校正 |
| **vpsAPI** | 后端通信 | - REST查询<br/>- WebSocket订阅<br/>- 环境检测 |
| **audioService** | 音频提示 | - 声音反馈<br/>- 启用/禁用 |
| **settingsManager** | 用户设置 | - LocalStorage持久化<br/>- 自动加载 |

---

#### **Components（UI渲染层）**

| 组件 | 功能 | 核心技术 |
|------|------|--------|
| **FootprintChart** | 足迹图+热力图 | - Canvas多层渲染<br/>- 交互式缩放<br/>- 实时更新 |
| **VolumeProfile** | 成交量分布 | - 柱状图<br/>- 价格分析 |
| **OrderBook** | 买卖盘展示 | - 数据绑定<br/>- 比例计算 |
| **MLDashboard** | ML预测结果 | - 模型调用<br/>- 可视化 |

**图表引擎架构**:

```
RenderEngine (Canvas主循环)
    ├─ ChartState (数据状态)
    ├─ CoordinateSystem (坐标转换)
    ├─ InputHandler (交互处理)
    └─ 多层次渲染
        ├─ GridLayer
        ├─ CandleLayer
        ├─ AnalysisLayer
        ├─ CrosshairLayer
        └─ HeatmapLayer
```

---

#### **前端数据流**

```
用户操作 (点击/缩放/拖拽)
    ↓
InputHandler (捕获事件)
    ↓
ChartState (更新状态)
    ↓
需要新数据? 
    ├─ 是 → Services (调用API)
    │   ├─ binanceWS (实时)
    │   ├─ binanceREST (历史)
    │   └─ vpsAPI (后端查询)
    └─ 否 → RenderEngine (重排)
    ↓
所有Layer (分层渲染)
    ├─ GridLayer (坐标轴)
    ├─ CandleLayer (K线)
    ├─ AnalysisLayer (指标)
    ├─ HeatmapLayer (热力图)
    └─ CrosshairLayer (十字)
    ↓
Canvas绘制 (屏幕显示)
```

---

## 后端模块(SERVER)

### 📁 目录结构

```
server/
├── api.js                     # REST + WebSocket API服务器
├── collector.js               # 数据采集器 (24/7运行)
├── depth-collector.js         # 订单簿采集器
├── db.js                      # SQLite数据库管理
├── ml_service.py              # 机器学习服务
├── ml_trainer.py              # 模型训练
├── check_env.py               # 环境检查
├── package.json               # Node.js依赖
├── data/                      # SQLite数据库目录
│   └── cryptoflow.db
└── reset_trades_only.js       # 数据重置脚本
```

### 🎯 核心模块职责

#### **api.js - REST + WebSocket 服务器**

**职责**:
- ✅ Express.js REST API 端点
- ✅ WebSocket 实时推送
- ✅ 静态文件服务 (dist/)
- ✅ HTTPS/WSS 支持
- ✅ CORS 处理

**关键端点**:

```javascript
GET  /api/health           // 健康检查
GET  /api/symbols          // 可用交易对
GET  /api/candles          // 获取K线数据
GET  /api/trades           // 获取原始交易
GET  /api/depth            // 获取订单簿快照
POST /api/ml/predict       // ML预测
WS   /api/live             // WebSocket实时推送
```

**服务器配置**:

```javascript
PORT = 443 (HTTPS)
SSL_KEY = 'ssl/key.pem'
SSL_CERT = 'ssl/cert.pem'

Authentication: 
  Header: 'x-api-key'
  Value: 'CryptoFlowMasterKey2025!'
```

---

#### **collector.js - 数据采集器**

**职责**:
- ✅ 24/7 连接币安WebSocket
- ✅ 实时交易数据处理
- ✅ 自动K线聚合 (1/5/15/60分钟)
- ✅ 成交量分布计算
- ✅ 周期性数据保存

**配置**:

```javascript
CONFIG = {
    symbols: ['btcusdt', 'ethusdt', 'solusdt', 'bnbusdt'],
    tickSizes: {
        btcusdt: 10,
        ethusdt: 1,
        solusdt: 0.1,
        bnbusdt: 0.1
    },
    daysToKeep: 7,           // 保留7天数据
    cleanupIntervalMs: 3600000  // 每小时清理
}
```

**数据处理流程**:

```
Binance WebSocket (实时交易)
    ↓
交易解析
    ├─ 价格舍入 (按tick size)
    ├─ VWAP计算
    ├─ 买卖方向确定
    └─ 成交量分布更新
    ↓
K线聚合 (4个时间框)
    ├─ 1分钟K线
    ├─ 5分钟K线
    ├─ 15分钟K线
    └─ 60分钟K线
    ↓
周期保存 (每10秒)
    └─ SQLite 数据库
```

---

#### **depth-collector.js - 订单簿采集器**

**职责**:
- ✅ 订单簿实时同步
- ✅ 深度快照采集 (1秒间隔)
- ✅ 更新ID验证
- ✅ 热力图数据源

**流程**:

```
1. 获取初始快照 (REST)
   ├─ 获取 1000 档深度
   └─ 记录 lastUpdateId

2. 接收实时更新 (WebSocket)
   ├─ 验证 updateId 连续性
   ├─ 应用买卖变化
   └─ 缓冲处理

3. 定期快照 (1秒)
   ├─ 选择top 100档
   ├─ 过滤微小成交量
   └─ 保存到数据库
```

---

#### **db.js - SQLite 数据库**

**数据库结构**:

```sql
-- 原始交易 (保留7天)
CREATE TABLE trades (
    id INTEGER PRIMARY KEY,
    symbol TEXT,
    price REAL,
    quantity REAL,
    time INTEGER,
    is_buyer_maker INTEGER,
    trade_id TEXT UNIQUE
);

-- 4个K线表
CREATE TABLE candles_1 (  -- 1分钟
    id INTEGER PRIMARY KEY,
    symbol TEXT,
    time INTEGER,
    open REAL, high REAL, low REAL, close REAL,
    volume REAL, trades INTEGER, ...
);
-- candles_5, candles_15, candles_60 同理

-- 订单簿深度快照
CREATE TABLE depth_snapshots (
    id INTEGER PRIMARY KEY,
    symbol TEXT,
    time INTEGER,
    bids JSON,      -- [{price, quantity}, ...]
    asks JSON,
    updateId INTEGER
);

-- 成交量分布
CREATE TABLE volume_profiles (
    id INTEGER PRIMARY KEY,
    symbol TEXT,
    price REAL,
    buy_volume REAL,
    sell_volume REAL
);
```

**特性**:
- ✅ WAL 模式 (Write-Ahead Logging)
- ✅ 自动过期清理
- ✅ 索引优化 (symbol, time)
- ✅ 批量提交提升效率

---

#### **ml_service.py - 机器学习服务**

**职责**:
- ✅ 模型推理
- ✅ 特征计算
- ✅ 预测输出

**使用**:

```python
# 特征输入
features = {
    'candles': [...],        # K线序列
    'depth': {...},          # 深度数据
    'volume_profile': {...}  # 成交量分布
}

# 预测输出
prediction = {
    'direction': 'UP' | 'DOWN',
    'confidence': 0.0 - 1.0,
    'target': 1234.56
}
```

---

#### **后端数据流**

```
币安 Futures API
    ├─ WebSocket (汇总交易流)
    │   ├─ aggTrade@
    │   └─ depth@100ms
    └─ REST API (初始快照)
        └─ /fapi/v1/depth

    ↓ (collector.js)

数据处理
    ├─ 解析交易
    ├─ 舍入价格
    ├─ 计算VWAP
    └─ 聚合K线

    ↓ (db.js)

SQLite 存储
    ├─ trades (原始)
    ├─ candles_* (预聚合)
    ├─ depth_snapshots (深度)
    └─ volume_profiles (分布)

    ↓ (api.js)

API 层
    ├─ REST 端点 (查询)
    ├─ WebSocket (推送)
    └─ 前端数据服务

    ↓

前端应用
    ├─ 渲染图表
    ├─ 更新指标
    └─ 播放音频
```

---

## 前后端通信

### 通信方式

| 方式 | 用途 | 协议 | 延迟 |
|------|------|------|------|
| **WebSocket** | 实时推送<br/>双向通信 | WSS:443 | < 100ms |
| **REST API** | 历史数据查询<br/>配置同步 | HTTPS:443 | 200-500ms |
| **直连币安** | 实时市场数据<br/>不需后端中转 | WSS | 直接 |

### 环境检测

```javascript
// src/services/vpsAPI.js
const isLocalHost = window.location.hostname === 'localhost';

if (isLocalHost) {
    // 开发: 指向VPS IP
    baseUrl = 'https://100.86.66.124';
    wsUrl = 'wss://100.86.66.124';
} else {
    // 生产: 相对路径 (避免CORS)
    baseUrl = '';
    wsUrl = `wss://${window.location.hostname}`;
}
```

### API 调用示例

#### **获取K线数据**

```javascript
// 前端请求
const candles = await vpsAPI.getCandles('btcusdt', 1, 1000);

// 后端处理
GET /api/candles?symbol=btcusdt&tf=1&limit=1000

// 数据库查询
SELECT * FROM candles_1 
WHERE symbol = 'btcusdt' 
ORDER BY time DESC 
LIMIT 1000;

// 返回JSON
{
    candles: [
        {time: 1707819600000, open: 42000, high: 42500, ...},
        ...
    ]
}
```

#### **实时订阅**

```javascript
// 前端订阅
vpsAPI.on('trade', (trade) => {
    console.log(trade);  // {symbol, price, qty, time, ...}
});

// WebSocket推送
{
    type: 'trade',
    data: {
        symbol: 'btcusdt',
        price: 42150.50,
        quantity: 0.5,
        time: 1707819630000,
        isBuyerMaker: false
    }
}
```

---

## 部署架构

### 开发环境 (本地)

```
localhost:5173 (Vite Dev Server)
    ↕ (HTTP + WebSocket)
localhost:443 (Node.js + Express)
    ↕ (HTTP Request)
Binance API
```

**启动命令**:
```bash
# 终端 1: 前端
npm run dev

# 终端 2: 后端 (可选)
cd server && npm start
```

---

### 生产环境 (Windows VPS)

```
VPS IP: 100.86.66.124
Port: 443 (HTTPS + WSS)

C:\CryptoFlow\
├── dist/                 (前端构建产物)
│   ├── index.html
│   ├── assets/
│   └── ...
├── server/              (后端源码)
│   ├── api.js
│   ├── collector.js
│   ├── db.js
│   └── data/cryptoflow.db
├── ssl/                 (SSL证书)
│   ├── key.pem
│   └── cert.pem
└── package.json
```

**启动方式**:

```powershell
# PM2 管理
pm2 start server/api.js --name "CryptoFlow"
pm2 start server/collector.js --name "Collector"
pm2 status
pm2 logs

# 部署流程
npm run build               # 构建前端
scp -r dist/* vps:/path/   # 上传前端
pm2 restart all            # 重启后端
```

---

## 关键职责总结

### 职责划分

| 层次 | 组件 | 职责 |
|------|------|------|
| **UI层** | Components | - 渲染用户界面<br/>- Canvas图表绘制<br/>- 事件处理 |
| **业务逻辑层** | Services | - 数据聚合<br/>- API调用<br/>- 实时更新 |
| **前端框架** | Vite | - 模块打包<br/>- 热重载开发<br/>- 生产构建 |
| **API层** | api.js | - REST端点<br/>- WebSocket推送<br/>- 认证授权 |
| **采集层** | collector.js | - 24/7数据采集<br/>- K线聚合<br/>- 实时处理 |
| **存储层** | db.js | - 数据持久化<br/>- 快速查询<br/>- 自动清理 |
| **模型层** | ml_service.py | - 特征计算<br/>- 模型推理<br/>- 预测输出 |

---

### 数据流总览

```
              ┌─────────────────────┐
              │  用户交互 (浏览器)   │
              └──────────┬──────────┘
                         ↓
        ┌────────────────────────────────┐
        │  前端 (Vanilla JS + Canvas)     │
        │  ├─ main.js                     │
        │  ├─ Components (UI)             │
        │  └─ Services (Logic)            │
        └────────┬───────────┬────────────┘
                 ↓           ↓
            WebSocket    REST API
                 ↑           ↑
        ┌────────┴───────────┴────────────┐
        │  后端 (Node.js + Express)       │
        │  ├─ api.js (API服务)            │
        │  ├─ collector.js (采集)         │
        │  ├─ depth-collector.js (订单簿) │
        │  └─ db.js (数据库)              │
        └──────────┬─────────┬────────────┘
                   ↓         ↓
              SQLite数据库  Binance API
```

---

## 设计原理

### 1. 为什么前后端分离？

✅ **独立开发**: 前端和后端可并行开发  
✅ **独立部署**: 前端可CDN部署，后端独立更新  
✅ **横向扩展**: 多个前端实例共用一个后端  
✅ **技术灵活**: 可轻易切换前端框架而保持后端不变  

### 2. 为什么后端24小时采集数据？

✅ **数据完整性**: 前端关闭也不丢失交易  
✅ **离线分析**: 用户可随时查看历史数据  
✅ **提高性能**: 数据已预处理/预聚合，查询速度快  
✅ **支持ML**: 机器学习需要完整历史数据  

### 3. 为什么使用SQLite？

✅ **零配置**: 不需独立服务器  
✅ **秒级查询**: 本地存储，查询极快  
✅ **自动备份**: 单个数据文件易于备份  
✅ **成本低**: 无需数据库服务费  

### 4. 为什么用Canvas而不是SVG？

✅ **高性能**: 处理数千个对象无压力  
✅ **实时渲染**: 帧率稳定，适合交易场景  
✅ **灵活绘制**: 复杂自定义图形容易实现  
✅ **内存效率**: 不生成DOM节点  

### 5. 为什么WebSocket + REST混用？

✅ **实时性**: WebSocket用于推送（低延迟）  
✅ **历史数据**: REST用于查询（易缓存）  
✅ **容错**: 若WS断连，可降级到REST  
✅ **灵活度**: 不同场景用最优方案  

---

## 总结

**CryptoFlow** 是一个设计精良的交易可视化系统：

| 方面 | 特点 |
|------|------|
| **架构** | 前后端分离，采集层独立 |
| **性能** | Canvas高性能，SQLite快速查询 |
| **可靠性** | 24/7采集，数据持久化 |
| **扩展性** | 服务解耦，易于添加功能 |
| **用户体验** | 实时推送，离线支持 |

这个架构非常适合**生产级交易平台**的需求！

---

**文档版本**: 1.0  
**最后更新**: 2026年2月13日  
**维护者**: AI Assistant
