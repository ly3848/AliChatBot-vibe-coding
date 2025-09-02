const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');

// 对话管理接口
// 获取对话列表
router.get('/conversations', conversationController.getConversations);

// 创建新对话
router.post('/conversations', conversationController.createConversation);

// 删除对话
router.delete('/conversations/:id', conversationController.deleteConversation);

// 消息管理接口
// 获取对话消息列表
router.get('/conversations/:conversation_id/messages', conversationController.getMessages);

// 发送消息
router.post('/conversations/:conversation_id/messages', conversationController.sendMessage);

// 流式响应接口
router.post('/conversations/:conversation_id/messages/stream', conversationController.streamMessage);

module.exports = router;