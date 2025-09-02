const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const db = require('../config/database');

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

// 健康检查接口
router.get('/health', (req, res) => {
    try {
        // 验证API Key
        if (!process.env.DASHSCOPE_API_KEY) {
            return res.status(500).json({
                code: 1003,
                message: 'API Key未配置',
                data: null
            });
        }
        
        // 验证API Key格式
        if (!process.env.DASHSCOPE_API_KEY.startsWith('sk-')) {
            return res.status(500).json({
                code: 1003,
                message: 'API Key格式不正确',
                data: null
            });
        }
        
        // 验证数据库连接
        db.get('SELECT 1', (err, row) => {
            if (err) {
                console.error('数据库连接检查失败:', err);
                return res.status(500).json({
                    code: 1003,
                    message: '数据库连接失败: ' + err.message,
                    data: null
                });
            }
            
            // 所有检查通过
            res.json({
                code: 0,
                message: '服务健康',
                data: {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    api_key_valid: true,
                    database_connected: true
                }
            });
        });
    } catch (error) {
        console.error('健康检查异常:', error);
        res.status(500).json({
            code: 1003,
            message: '健康检查失败: ' + error.message,
            data: null
        });
    }
});

module.exports = router;