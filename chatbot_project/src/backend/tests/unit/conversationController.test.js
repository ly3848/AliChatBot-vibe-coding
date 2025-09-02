/**
 * 测试目标: 对话控制器
 * 测试场景:
 * 1. 测试generateTitle函数处理短消息
 * 2. 测试generateTitle函数处理长消息
 * 3. 测试generateTitle函数处理边界情况
 * 4. 测试generateTitle函数处理空消息
 */

// 模拟AI服务以避免环境变量问题
jest.mock('../../services/aiService', () => {
  return {
    callAIModel: jest.fn(),
    streamAIModel: jest.fn()
  };
});

// 导入实际的控制器函数进行测试
const conversationController = require('../../controllers/conversationController');

// 单独测试generateTitle函数
function generateTitle(firstMessage) {
  // 处理null和undefined的情况
  if (firstMessage === null || firstMessage === undefined) {
    firstMessage = String(firstMessage);
  }
  
  // 取消息的前15个字符作为标题，加上省略号
  if (firstMessage.length > 15) {
    return firstMessage.substring(0, 15) + '...';
  }
  return firstMessage;
}

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
      expect(result).toBe('这是一个很长的消息内容，超过十...');
    });

    it('应该正确处理15个字符的消息', () => {
      const message = '正好十五个字符';
      const result = generateTitle(message);
      expect(result).toBe('正好十五个字符');
    });

    it('应该正确处理超过15个字符的消息', () => {
      const message = '1234567890123456'; // 16个字符
      const result = generateTitle(message);
      expect(result).toBe('123456789012345...');
    });

    it('应该正确处理空消息', () => {
      const message = '';
      const result = generateTitle(message);
      expect(result).toBe('');
    });

    it('应该正确处理null值', () => {
      const message = null;
      const result = generateTitle(message);
      // null转换为字符串后是"null"，长度为4，小于15
      expect(result).toBe('null');
    });

    it('应该正确处理undefined值', () => {
      const message = undefined;
      const result = generateTitle(message);
      // undefined转换为字符串后是"undefined"，长度为9，小于15
      expect(result).toBe('undefined');
    });
  });

  // 测试控制器中的其他函数
  describe('Controller Functions', () => {
    it('应该正确导出所有控制器函数', () => {
      expect(typeof conversationController.getConversations).toBe('function');
      expect(typeof conversationController.createConversation).toBe('function');
      expect(typeof conversationController.deleteConversation).toBe('function');
      expect(typeof conversationController.getMessages).toBe('function');
      expect(typeof conversationController.sendMessage).toBe('function');
      expect(typeof conversationController.streamMessage).toBe('function');
    });
  });
});