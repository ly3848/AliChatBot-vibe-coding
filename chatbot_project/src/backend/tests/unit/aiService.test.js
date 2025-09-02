/**
 * 测试目标: AI服务模块
 * 测试场景: 
 * 1. 测试callAIModel函数是否正确导出
 * 2. 测试streamAIModel函数是否正确导出
 * 3. 测试AI服务调用功能
 * 4. 测试AI服务错误处理
 */

// 模拟OpenAI模块以避免环境变量问题
jest.mock('openai', () => {
  const mockCreate = jest.fn();
  const mockInstance = {
    chat: {
      completions: {
        create: mockCreate
      }
    }
  };
  return jest.fn(() => mockInstance);
});

const OpenAI = require('openai');
const { callAIModel, streamAIModel } = require('../../services/aiService');

describe('AI Service', () => {
  beforeEach(() => {
    // 清除所有模拟调用记录
    jest.clearAllMocks();
  });

  describe('callAIModel', () => {
    it('应该正确导出callAIModel函数', () => {
      expect(typeof callAIModel).toBe('function');
    });

    it('应该成功调用AI模型并返回结果', async () => {
      // 模拟OpenAI API响应
      const mockResponse = {
        choices: [{ message: { content: '这是AI的回复' } }]
      };
      
      const OpenAIClass = OpenAI;
      const openaiInstance = new OpenAIClass();
      openaiInstance.chat.completions.create.mockResolvedValue(mockResponse);

      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: '你好' }
      ];

      const result = await callAIModel(messages);
      expect(result).toBe('这是AI的回复');
      expect(openaiInstance.chat.completions.create).toHaveBeenCalledWith({
        model: 'qwen-plus',
        messages: messages
      });
    });

    it('应该使用指定的模型调用AI服务', async () => {
      const mockResponse = {
        choices: [{ message: { content: '这是AI的回复' } }]
      };
      
      const OpenAIClass = OpenAI;
      const openaiInstance = new OpenAIClass();
      openaiInstance.chat.completions.create.mockResolvedValue(mockResponse);

      const messages = [{ role: 'user', content: '你好' }];
      const model = 'qwen-max';

      await callAIModel(messages, model);
      expect(openaiInstance.chat.completions.create).toHaveBeenCalledWith({
        model: model,
        messages: messages
      });
    });

    it('应该在API调用失败时抛出错误', async () => {
      const OpenAIClass = OpenAI;
      const openaiInstance = new OpenAIClass();
      openaiInstance.chat.completions.create.mockRejectedValue(new Error('API调用失败'));

      const messages = [{ role: 'user', content: '你好' }];

      await expect(callAIModel(messages)).rejects.toThrow('AI服务调用失败');
    });
  });

  describe('streamAIModel', () => {
    it('应该正确导出streamAIModel函数', () => {
      expect(typeof streamAIModel).toBe('function');
    });

    it('应该成功调用AI流式模型并返回结果', async () => {
      const mockStream = {};
      const OpenAIClass = OpenAI;
      const openaiInstance = new OpenAIClass();
      openaiInstance.chat.completions.create.mockResolvedValue(mockStream);

      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: '你好' }
      ];

      const result = await streamAIModel(messages);
      expect(result).toBe(mockStream);
      expect(openaiInstance.chat.completions.create).toHaveBeenCalledWith({
        model: 'qwen-plus',
        messages: messages,
        stream: true
      });
    });

    it('应该在流式API调用失败时抛出错误', async () => {
      const OpenAIClass = OpenAI;
      const openaiInstance = new OpenAIClass();
      openaiInstance.chat.completions.create.mockRejectedValue(new Error('流式API调用失败'));

      const messages = [{ role: 'user', content: '你好' }];

      await expect(streamAIModel(messages)).rejects.toThrow('AI服务调用失败');
    });
  });
});