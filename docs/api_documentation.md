# API接口文档

## 1. 概述

本文档详细描述了智能问答系统的API接口设计，包括接口地址、请求方法、参数说明、响应格式和错误处理。

## 2. 公共信息

### 2.1 基础URL
```
http://localhost:3000/api/v1
```

### 2.2 请求头
```
Content-Type: application/json
Accept: application/json
```

### 2.3 响应格式
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 2.4 错误响应格式
```json
{
  "code": 1001,
  "message": "错误描述",
  "data": null
}
```

### 2.5 状态码说明
| 状态码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 数据不存在 |
| 1003 | 服务器内部错误 |
| 1004 | 请求过于频繁 |

## 3. 对话管理接口

### 3.1 获取对话列表

#### 接口地址
```
GET /conversations
```

#### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码，默认为1 |
| limit | integer | 否 | 每页数量，默认为10，最大100 |

#### 响应示例
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "人工智能技术探讨",
        "created_at": "2023-05-01T10:00:00.000Z",
        "updated_at": "2023-05-01T10:05:00.000Z"
      },
      {
        "id": 2,
        "title": "Node.js开发问题",
        "created_at": "2023-05-01T11:00:00.000Z",
        "updated_at": "2023-05-01T11:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2
    }
  }
}
```

### 3.2 创建新对话

#### 接口地址
```
POST /conversations
```

#### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 否 | 对话标题，不传则自动生成 |

#### 请求示例
```json
{
  "title": "Vue.js开发问题"
}
```

#### 响应示例
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 3,
    "title": "Vue.js开发问题",
    "created_at": "2023-05-01T12:00:00.000Z",
    "updated_at": "2023-05-01T12:00:00.000Z"
  }
}
```

### 3.3 删除对话

#### 接口地址
```
DELETE /conversations/{id}
```

#### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | integer | 是 | 对话ID |

#### 响应示例
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

## 4. 消息管理接口

### 4.1 获取对话消息列表

#### 接口地址
```
GET /conversations/{conversation_id}/messages
```

#### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| conversation_id | integer | 是 | 对话ID |

#### 响应示例
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "conversation_id": 1,
      "role": "user",
      "content": "什么是人工智能？",
      "created_at": "2023-05-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "conversation_id": 1,
      "role": "assistant",
      "content": "人工智能是计算机科学的一个分支...",
      "created_at": "2023-05-01T10:00:30.000Z"
    }
  ]
}
```

### 4.2 发送消息

#### 接口地址
```
POST /conversations/{conversation_id}/messages
```

#### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| conversation_id | integer | 是 | 对话ID |
| content | string | 是 | 消息内容 |

#### 请求示例
```json
{
  "content": "请详细介绍一下机器学习"
}
```

#### 响应示例（同步模式）
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user_message": {
      "id": 3,
      "conversation_id": 1,
      "role": "user",
      "content": "请详细介绍一下机器学习",
      "created_at": "2023-05-01T10:05:00.000Z"
    },
    "assistant_message": {
      "id": 4,
      "conversation_id": 1,
      "role": "assistant",
      "content": "机器学习是人工智能的一个重要分支...",
      "created_at": "2023-05-01T10:05:30.000Z"
    }
  }
}
```

### 4.3 流式响应接口

#### 接口地址
```
POST /conversations/{conversation_id}/messages/stream
```

#### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| conversation_id | integer | 是 | 对话ID |
| content | string | 是 | 消息内容 |

#### 响应格式
使用Server-Sent Events (SSE)协议进行流式传输

#### 响应示例
```
data: {"type": "start", "data": {"message_id": 5}}

data: {"type": "chunk", "data": {"content": "机器学习是"}}

data: {"type": "chunk", "data": {"content": "人工智能的一个重要分支"}}

data: {"type": "chunk", "data": {"content": "，它使计算机能够..."}}

data: {"type": "end", "data": {"message_id": 5, "created_at": "2023-05-01T10:10:00.000Z"}}

data: [DONE]
```

#### 消息类型说明
| 类型 | 说明 |
|------|------|
| start | 开始响应，返回消息ID |
| chunk | 响应内容片段 |
| end | 响应结束，返回完整消息信息 |
| [DONE] | 流结束标识 |

## 5. 错误处理

### 5.1 通用错误码
| 错误码 | 说明 | HTTP状态码 |
|--------|------|------------|
| 1001 | 参数错误 | 400 |
| 1002 | 数据不存在 | 404 |
| 1003 | 服务器内部错误 | 500 |
| 1004 | 请求过于频繁 | 429 |

### 5.2 具体错误示例
```json
{
  "code": 1001,
  "message": "参数content不能为空",
  "data": null
}
```

## 6. 安全考虑

### 6.1 访问控制
- 所有API接口需要进行身份验证（MVP阶段可暂时忽略）
- 敏感操作需要额外权限验证

### 6.2 数据验证
- 所有输入参数都需要进行验证
- 防止SQL注入和XSS攻击

### 6.3 限流策略
- 对API接口进行限流，防止恶意请求
- 默认限制每个IP每分钟100次请求

## 7. 性能优化建议

### 7.1 缓存策略
- 对话列表可使用缓存提高访问速度
- 常用对话内容可进行缓存

### 7.2 数据库优化
- 合理使用索引提高查询效率
- 对大文本字段考虑分表存储

### 7.3 响应压缩
- 启用Gzip压缩减少传输数据量