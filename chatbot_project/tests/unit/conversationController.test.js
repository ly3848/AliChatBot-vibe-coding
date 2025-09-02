/**
 * 测试目标: 对话控制器
 * 测试场景:
 * 1. 测试generateTitle函数处理短消息
 * 2. 测试generateTitle函数处理长消息
 * 3. 测试generateTitle函数处理边界情况
 */

const { generateTitle } = require('../../src/backend/controllers/conversationController');

// 模拟数据库操作
jest.mock('../../src/backend/config/database', () => {
  return {};
});

// 模拟AI服务
jest.mock('../../src/backend/services/aiService', () => {
  return {
    callAIModel: jest.fn(),
    streamAIModel: jest.fn()
  };
});

describe('Conversation Controller', () => {
  describe('generateTitle', () => {
    it('应该为短消息返回原内容', () => {
      const shortMessage = '你好';
      const result = generateTitle(shortMessage);
      expect(result).toBe(shortMessage);
    });

    it('应该为长消息返回截断内容加省略号', () => {
      const longMessage = '这是一个很长的消息内容，超过十五个字符';
      const result = generateTitle(longMessage);
      expect(result).toBe('这是一个很长的消...');
    });

    it('应该正确处理15个字符的消息', () => {
      const message = '正好十五个字符';
      const result = generateTitle(message);
      expect(result).toBe('正好十五个字符');
    });

    it('应该正确处理16个字符的消息', () => {
      const message = '这是十六个字符的消息';
      const result = generateTitle(message);
      expect(result).toBe('这是十六个字符的...');
    });
  });
});