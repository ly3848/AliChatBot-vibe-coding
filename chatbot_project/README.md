# 智能问答系统

基于阿里百炼API的智能问答Web应用，支持多轮对话交互和对话历史管理。

## 功能特性

- 多轮对话交互：支持上下文关联的连续问答
- 对话管理：包含新开对话、历史记录查看和删除
- 流式响应：模拟AI助手的流式回答效果
- 响应式设计：适配桌面端和移动端

## 技术栈

### 后端
- Node.js + Express.js
- SQLite 数据库
- RESTful API 设计

### 前端
- 原生 HTML/CSS/JavaScript
- 响应式设计
- Server-Sent Events (SSE) 实现流式响应

## 项目结构

```
chatbot_project/
├── src/
│   ├── backend/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── .env
│   │   ├── package.json
│   │   └── server.js
│   └── frontend/
│       ├── js/
│       ├── styles/
│       └── index.html
├── data/
└── docs/
```

## 快速开始

### 环境要求
- Node.js >= 14.x
- npm >= 6.x

### 安装依赖
```bash
cd src/backend
npm install
```

### 启动服务
```bash
npm start
```

服务将在 `http://localhost:3000` 启动

## API 接口

### 对话管理
- `GET /api/v1/conversations` - 获取对话列表
- `POST /api/v1/conversations` - 创建新对话
- `DELETE /api/v1/conversations/:id` - 删除对话

### 消息管理
- `GET /api/v1/conversations/:conversation_id/messages` - 获取对话消息列表
- `POST /api/v1/conversations/:conversation_id/messages` - 发送消息
- `POST /api/v1/conversations/:conversation_id/messages/stream` - 流式发送消息

## 数据库设计

### 对话表(conversations)
| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | INTEGER | 对话唯一标识符 |
| title | VARCHAR(255) | 对话标题 |
| created_at | DATETIME | 对话创建时间 |
| updated_at | DATETIME | 对话最后更新时间 |

### 消息表(messages)
| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | INTEGER | 消息唯一标识符 |
| conversation_id | INTEGER | 所属对话ID |
| role | VARCHAR(50) | 消息角色(user/assistant) |
| content | TEXT | 消息内容 |
| created_at | DATETIME | 消息创建时间 |

## 开发指南

### 后端开发
1. 修改后端代码在 `src/backend` 目录
2. 控制器逻辑在 `controllers/` 目录
3. 路由定义在 `routes/` 目录

### 前端开发
1. 修改前端代码在 `src/frontend` 目录
2. 主要交互逻辑在 `js/main.js`
3. 样式文件在 `styles/main.css`

## 部署说明

1. 确保服务器已安装 Node.js 环境
2. 将项目文件上传到服务器
3. 安装依赖：`npm install`
4. 启动服务：`npm start`
5. 可使用 PM2 等进程管理工具保持服务运行

## 后续优化方向

1. 集成真实的AI服务API（如阿里百炼）
2. 添加用户认证系统
3. 实现文档上传与解析功能
4. 添加对话分享功能
5. 优化移动端体验
6. 增加对话导出功能