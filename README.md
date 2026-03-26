# 中国城市舞萌指数地图

一个基于 React + Vite + ECharts 的数据可视化项目，用于展示中国地级以上城市的舞萌机台分布与舞萌指数（每万人口机台数量）。

## 项目简介

该项目通过地图散点、Top 排行和省份筛选等交互形式，展示各城市舞萌 DX 机台数量与人口规模之间的关系，帮助快速观察区域差异。

## 功能特性

- 全国地图散点可视化（支持缩放、拖拽）
- 省份筛选与省内排行榜切换
- 全国 Top20 城市指数排行
- 城市悬浮提示（机台数、人口、GDP、人均 GDP 等）
- 指数分级配色与 Top10 涟漪高亮
- 统计卡片展示（覆盖城市、机台总数、最高/平均指数）

## 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite 7
- **样式系统**：Tailwind CSS + shadcn/ui
- **可视化**：Apache ECharts
- **图标**：lucide-react

## 快速开始

### 1) 环境要求

- Bun 1.3+

### 2) 安装依赖

```bash
bun install
```

### 3) 启动开发环境

```bash
bun dev
```

默认情况下，Vite 会在本地启动开发服务器（端口以终端输出为准）。

### 4) 构建生产版本

```bash
bun run build
```

### 5) 本地预览构建产物

```bash
bun run preview
```

## 常用脚本

- `bun dev`：启动开发服务器
- `bun run build`：TypeScript 构建检查 + Vite 打包
- `bun run preview`：预览生产构建
- `bun run lint`：运行 ESLint

## 数据来源

项目中使用了以下数据文件：

- `raw-data/舞萌机台数量.json` 来自[全国音游地图](https://map.bemanicn.com/games/1)
- `raw-data/中国城市统计年鉴2024地级以上城市人口.json` 来自[中国城市统计年鉴2024](https://data.cnki.net/yearBook/single?id=N2025020156&pinyinCode=YZGCA)
- `public/中华人民共和国.geojson`（中国地图 GeoJSON） 来自[阿里云DataV.GeoAtlas](https://datav.aliyun.com/portal/school/atlas/area_selector)

处理后的前端数据位于：

- `src/data/cityData.json`
- `src/data/provinceData.json`
- `src/data/provinceList.json`
- `src/data/provinceStats.json`


## 指数计算与可视化规则

### 指数公式

```text
舞萌指数 = 机台数量 / 人口(万)
```

### 地图展示变换

```text
显示值 = log10(舞萌指数 * 1000 + 1)
```

使用对数变换是为了在地图上更清晰地区分低值与中高值城市。

### 颜色分级

- `> 0.15`：极高
- `0.08 - 0.15`：很高
- `0.05 - 0.08`：较高
- `0.02 - 0.05`：中等
- `0.01 - 0.02`：较低
- `< 0.01`：低

## 目录结构

```text
maimai-index/
├─ public/
│  └─ 中华人民共和国.geojson             # 中国地图 GeoJSON
├─ raw-data/
│  ├─ 舞萌机台数量.json
│  └─ 中国城市统计年鉴2024地级以上城市人口.json
├─ src/
│  ├─ components/
│  │  ├─ ChinaMap.tsx              # 地图可视化
│  │  ├─ ProvinceSelector.tsx      # 省份筛选
│  │  ├─ CityRanking.tsx           # 排行榜
│  │  ├─ ProvinceDetail.tsx        # 省份详情
│  │  ├─ StatsCard.tsx             # 统计卡片
│  │  └─ ui/                       # shadcn/ui 组件
│  ├─ data/                        # 清洗后的业务数据
│  ├─ hooks/                       # 自定义 hooks
│  ├─ lib/                         # 工具函数
│  ├─ App.tsx                      # 页面主入口
│  └─ main.tsx                     # 应用入口
├─ index.html
├─ vite.config.ts                  # Vite 配置
└─ package.json                    # 依赖与脚本
```

## 部署建议

项目 `vite.config.ts` 中配置了 `base: './'`，适合静态资源相对路径部署。

可选部署平台：

- GitHub Pages
- Vercel
- Netlify
- 任意支持静态站点托管的服务器

典型流程：

```bash
bun run build
```

将 `dist/` 目录上传到你的静态托管平台即可。