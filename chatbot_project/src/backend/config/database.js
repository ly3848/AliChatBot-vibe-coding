const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 确保数据目录存在
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 数据库文件路径
const dbPath = path.join(dataDir, 'chatbot.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('数据库连接成功:', dbPath);
    initializeDatabase();
  }
});

// 初始化数据库表
function initializeDatabase() {
  // 创建 conversations 表
  db.run(`CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('创建 conversations 表失败:', err.message);
    } else {
      console.log('conversations 表创建成功');
      // 在 conversations 表创建成功后再创建相关索引和触发器
      initializeConversationsExtras();
    }
  });

  // 创建 messages 表
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    role VARCHAR(50) NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
  )`, (err) => {
    if (err) {
      console.error('创建 messages 表失败:', err.message);
    } else {
      console.log('messages 表创建成功');
      // 在 messages 表创建成功后再创建相关索引
      initializeMessagesExtras();
    }
  });
}

// 初始化 conversations 表的索引和触发器
function initializeConversationsExtras() {
  // 创建索引
  db.run('CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at)', (err) => {
    if (err) {
      console.error('创建 conversations 索引失败:', err.message);
    } else {
      console.log('conversations 索引创建成功');
    }
  });

  // 创建触发器更新 updated_at 字段
  db.run(`CREATE TRIGGER IF NOT EXISTS update_conversations_updated_at 
    AFTER UPDATE ON conversations 
    FOR EACH ROW 
    BEGIN 
      UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END`, (err) => {
    if (err) {
      console.error('创建触发器失败:', err.message);
    } else {
      console.log('触发器创建成功');
    }
  });
}

// 初始化 messages 表的索引
function initializeMessagesExtras() {
  db.run('CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)', (err) => {
    if (err) {
      console.error('创建 messages conversation_id 索引失败:', err.message);
    } else {
      console.log('messages conversation_id 索引创建成功');
    }
  });

  db.run('CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)', (err) => {
    if (err) {
      console.error('创建 messages created_at 索引失败:', err.message);
    } else {
      console.log('messages created_at 索引创建成功');
    }
  });

  db.run('CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role)', (err) => {
    if (err) {
      console.error('创建 messages role 索引失败:', err.message);
    } else {
      console.log('messages role 索引创建成功');
    }
  });
}

module.exports = db;