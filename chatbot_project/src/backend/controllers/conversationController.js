const db = require('../config/database');

// 生成对话标题
function generateTitle(firstMessage) {
  // 取消息的前15个字符作为标题，加上省略号
  if (firstMessage.length > 15) {
    return firstMessage.substring(0, 15) + '...';
  }
  return firstMessage;
}

// 获取对话列表
exports.getConversations = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // 查询总数
  db.get('SELECT COUNT(*) as total FROM conversations', (err, result) => {
    if (err) {
      return res.status(500).json({
        code: 1003,
        message: '数据库查询失败',
        data: null
      });
    }

    const total = result.total;

    // 查询对话列表
    db.all(`
      SELECT id, title, created_at, updated_at 
      FROM conversations 
      ORDER BY updated_at DESC 
      LIMIT ? OFFSET ?
    `, [limit, offset], (err, rows) => {
      if (err) {
        return res.status(500).json({
          code: 1003,
          message: '数据库查询失败',
          data: null
        });
      }

      res.json({
        code: 0,
        message: 'success',
        data: {
          list: rows,
          pagination: {
            page: page,
            limit: limit,
            total: total
          }
        }
      });
    });
  });
};

// 创建新对话
exports.createConversation = (req, res) => {
  const { title } = req.body;

  // 如果没有提供标题，则创建一个空标题的对话
  const conversationTitle = title || '新对话';

  db.run(`
    INSERT INTO conversations (title) 
    VALUES (?)
  `, [conversationTitle], function(err) {
    if (err) {
      return res.status(500).json({
        code: 1003,
        message: '创建对话失败',
        data: null
      });
    }

    // 返回创建的对话信息
    res.status(201).json({
      code: 0,
      message: 'success',
      data: {
        id: this.lastID,
        title: conversationTitle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  });
};

// 删除对话
exports.deleteConversation = (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM conversations WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({
        code: 1003,
        message: '删除对话失败',
        data: null
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        code: 1002,
        message: '对话不存在',
        data: null
      });
    }

    // 同时删除关联的消息
    db.run('DELETE FROM messages WHERE conversation_id = ?', [id], (err) => {
      if (err) {
        console.error('删除关联消息失败:', err.message);
      }
    });

    res.json({
      code: 0,
      message: 'success',
      data: null
    });
  });
};

// 获取对话消息列表
exports.getMessages = (req, res) => {
  const { conversation_id } = req.params;

  // 检查对话是否存在
  db.get('SELECT id FROM conversations WHERE id = ?', [conversation_id], (err, row) => {
    if (err) {
      return res.status(500).json({
        code: 1003,
        message: '数据库查询失败',
        data: null
      });
    }

    if (!row) {
      return res.status(404).json({
        code: 1002,
        message: '对话不存在',
        data: null
      });
    }

    // 查询消息列表
    db.all(`
      SELECT id, conversation_id, role, content, created_at 
      FROM messages 
      WHERE conversation_id = ? 
      ORDER BY created_at ASC
    `, [conversation_id], (err, rows) => {
      if (err) {
        return res.status(500).json({
          code: 1003,
          message: '数据库查询失败',
          data: null
        });
      }

      res.json({
        code: 0,
        message: 'success',
        data: rows
      });
    });
  });
};

// 发送消息
exports.sendMessage = (req, res) => {
  const { conversation_id } = req.params;
  const { content } = req.body;

  // 参数验证
  if (!content) {
    return res.status(400).json({
      code: 1001,
      message: '参数content不能为空',
      data: null
    });
  }

  // 检查对话是否存在
  db.get('SELECT id, title FROM conversations WHERE id = ?', [conversation_id], (err, conversation) => {
    if (err) {
      return res.status(500).json({
        code: 1003,
        message: '数据库查询失败',
        data: null
      });
    }

    if (!conversation) {
      return res.status(404).json({
        code: 1002,
        message: '对话不存在',
        data: null
      });
    }

    // 如果是新对话且没有标题，则根据第一条消息生成标题
    if (conversation.title === '新对话') {
      const newTitle = generateTitle(content);
      db.run('UPDATE conversations SET title = ? WHERE id = ?', [newTitle, conversation_id], (err) => {
        if (err) {
          console.error('更新对话标题失败:', err.message);
        }
      });
    }

    // 保存用户消息
    db.run(`
      INSERT INTO messages (conversation_id, role, content) 
      VALUES (?, ?, ?)
    `, [conversation_id, 'user', content], function(err) {
      if (err) {
        return res.status(500).json({
          code: 1003,
          message: '保存消息失败',
          data: null
        });
      }

      const userMessage = {
        id: this.lastID,
        conversation_id: parseInt(conversation_id),
        role: 'user',
        content: content,
        created_at: new Date().toISOString()
      };

      // 模拟AI助手回复（实际项目中这里会调用AI API）
      const assistantContent = `我是AI助手，我收到了您的消息: "${content}"。这是一个模拟回复，在实际应用中，这里会是来自AI模型的真实回复。`;

      // 保存助手消息
      db.run(`
        INSERT INTO messages (conversation_id, role, content) 
        VALUES (?, ?, ?)
      `, [conversation_id, 'assistant', assistantContent], function(err) {
        if (err) {
          return res.status(500).json({
            code: 1003,
            message: '保存助手消息失败',
            data: null
          });
        }

        const assistantMessage = {
          id: this.lastID,
          conversation_id: parseInt(conversation_id),
          role: 'assistant',
          content: assistantContent,
          created_at: new Date().toISOString()
        };

        // 更新对话的updated_at字段
        db.run('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [conversation_id], (err) => {
          if (err) {
            console.error('更新对话时间失败:', err.message);
          }
        });

        res.json({
          code: 0,
          message: 'success',
          data: {
            user_message: userMessage,
            assistant_message: assistantMessage
          }
        });
      });
    });
  });
};

// 流式响应接口
exports.streamMessage = (req, res) => {
  const { conversation_id } = req.params;
  const { content } = req.body;

  // 参数验证
  if (!content) {
    return res.status(400).json({
      code: 1001,
      message: '参数content不能为空',
      data: null
    });
  }

  // 设置SSE响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // 检查对话是否存在
  db.get('SELECT id, title FROM conversations WHERE id = ?', [conversation_id], (err, conversation) => {
    if (err) {
      res.write(`data: ${JSON.stringify({code: 1003, message: '数据库查询失败', data: null})}\n\n`);
      return res.end();
    }

    if (!conversation) {
      res.write(`data: ${JSON.stringify({code: 1002, message: '对话不存在', data: null})}\n\n`);
      return res.end();
    }

    // 如果是新对话且没有标题，则根据第一条消息生成标题
    if (conversation.title === '新对话') {
      const newTitle = generateTitle(content);
      db.run('UPDATE conversations SET title = ? WHERE id = ?', [newTitle, conversation_id], (err) => {
        if (err) {
          console.error('更新对话标题失败:', err.message);
        }
      });
    }

    // 保存用户消息
    db.run(`
      INSERT INTO messages (conversation_id, role, content) 
      VALUES (?, ?, ?)
    `, [conversation_id, 'user', content], function(err) {
      if (err) {
        res.write(`data: ${JSON.stringify({code: 1003, message: '保存消息失败', data: null})}\n\n`);
        return res.end();
      }

      const userMessageId = this.lastID;

      // 模拟AI助手流式回复
      const assistantContent = `我是AI助手，我收到了您的消息: "${content}"。这是一个模拟的流式回复，在实际应用中，这里会是来自AI模型的实时回复。流式传输可以让用户在等待完整回复的过程中看到部分结果，提升用户体验。`;
      
      // 发送开始消息
      res.write(`data: ${JSON.stringify({type: 'start', data: {message_id: userMessageId + 1}})}\n\n`);

      // 分块发送内容
      const chunks = assistantContent.match(/.{1,10}/g) || [assistantContent];
      let index = 0;
      
      const sendChunk = () => {
        if (index < chunks.length) {
          res.write(`data: ${JSON.stringify({type: 'chunk', data: {content: chunks[index]}})}\n\n`);
          index++;
          setTimeout(sendChunk, 100); // 每100ms发送一次，模拟真实流式响应
        } else {
          // 保存助手消息到数据库
          db.run(`
            INSERT INTO messages (conversation_id, role, content) 
            VALUES (?, ?, ?)
          `, [conversation_id, 'assistant', assistantContent], function(err) {
            if (err) {
              console.error('保存助手消息失败:', err.message);
            }
            
            // 发送结束消息
            res.write(`data: ${JSON.stringify({type: 'end', data: {message_id: userMessageId + 1, created_at: new Date().toISOString()}})}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
            
            // 更新对话的updated_at字段
            db.run('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [conversation_id], (err) => {
              if (err) {
                console.error('更新对话时间失败:', err.message);
              }
            });
          });
        }
      };
      
      sendChunk();
    });
  });
};