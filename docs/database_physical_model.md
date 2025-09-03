# 数据库物理模型文档

## 1. 概述

本文档详细描述了智能问答系统的数据库物理模型设计，包括表结构、字段定义、数据类型、约束条件和索引策略。

## 2. 表结构详细设计

### 2.1 对话表(conversations)

#### 表结构定义
| 字段名 | 数据类型 | 约束 | 默认值 | 描述 |
|--------|---------|------|--------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 无 | 对话唯一标识符 |
| title | VARCHAR(255) | NOT NULL | 无 | 对话标题 |
| created_at | DATETIME | NOT NULL | CURRENT_TIMESTAMP | 对话创建时间 |
| updated_at | DATETIME | NOT NULL | CURRENT_TIMESTAMP | 对话最后更新时间 |

#### 索引设计
| 索引名 | 字段 | 类型 | 描述 |
|--------|------|------|------|
| idx_conversations_created_at | created_at | 普通索引 | 按创建时间排序查询优化 |

#### 触发器设计
```sql
-- 更新updated_at字段的触发器
CREATE TRIGGER update_conversations_updated_at 
    AFTER UPDATE ON conversations 
    FOR EACH ROW 
    BEGIN 
        UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
```

### 2.2 消息表(messages)

#### 表结构定义
| 字段名 | 数据类型 | 约束 | 默认值 | 描述 |
|--------|---------|------|--------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 无 | 消息唯一标识符 |
| conversation_id | INTEGER | NOT NULL, FOREIGN KEY REFERENCES conversations(id) | 无 | 所属对话ID |
| role | VARCHAR(50) | NOT NULL, CHECK(role IN ('user', 'assistant')) | 无 | 消息角色(user/assistant) |
| content | TEXT | NOT NULL | 无 | 消息内容 |
| created_at | DATETIME | NOT NULL | CURRENT_TIMESTAMP | 消息创建时间 |

#### 约束设计
1. 外键约束：conversation_id 引用 conversations.id
2. 检查约束：role 字段只能是 'user' 或 'assistant'

#### 索引设计
| 索引名 | 字段 | 类型 | 描述 |
|--------|------|------|------|
| idx_messages_conversation_id | conversation_id | 普通索引 | 按对话ID查询优化 |
| idx_messages_created_at | created_at | 普通索引 | 按创建时间排序查询优化 |
| idx_messages_role | role | 普通索引 | 按角色查询优化 |

## 3. 完整建表语句

```sql
-- 创建对话表
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建消息表
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    role VARCHAR(50) NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- 创建索引
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_role ON messages(role);

-- 创建触发器
CREATE TRIGGER update_conversations_updated_at 
    AFTER UPDATE ON conversations 
    FOR EACH ROW 
    BEGIN 
        UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
```

## 4. 数据初始化

### 4.1 初始数据示例

```sql
-- 插入示例对话
INSERT INTO conversations (title) VALUES 
('人工智能技术探讨'),
('Node.js开发问题'),
('产品需求讨论');

-- 插入示例消息
INSERT INTO messages (conversation_id, role, content) VALUES 
(1, 'user', '什么是人工智能？'),
(1, 'assistant', '人工智能是计算机科学的一个分支，旨在创建能够执行通常需要人类智能的任务的系统...'),
(1, 'user', '它有哪些应用领域？'),
(1, 'assistant', '人工智能在医疗、金融、交通、教育、制造业等多个领域都有广泛应用...'),
(2, 'user', '如何在Node.js中处理异步操作？'),
(2, 'assistant', '在Node.js中，可以使用回调函数、Promise或async/await来处理异步操作...');
```

## 5. 性能优化建议

### 5.1 查询优化
1. 对于按对话查询消息的场景，使用[idx_messages_conversation_id]索引
2. 对于按时间排序的场景，使用[idx_messages_created_at]和[idx_conversations_created_at]索引
3. 对于按角色筛选的场景，使用[idx_messages_role]索引

### 5.2 存储优化
1. 对于大文本字段(content)，考虑使用外部存储或压缩存储
2. 定期清理过期对话数据，保持数据库性能

### 5.3 扩展性考虑
1. 当数据量增长时，可考虑对messages表进行分表处理
2. 可添加message_type字段以支持不同类型的消息（文本、图片、文件等）