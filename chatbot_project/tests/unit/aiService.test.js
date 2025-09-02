/**
 * 测试目标: AI服务模块
 * 测试场景: 
 * 1. 测试callAIModel函数是否正确导出
 * 2. 测试streamAIModel函数是否正确导出
 */

const { callAIModel, streamAIModel } = require('../../src/backend/services/aiService');

describe('AI Service', () => {
  describe('callAIModel', () => {
    it('应该正确导出callAIModel函数', () => {
      expect(typeof callAIModel).toBe('function');
    });
  });

  describe('streamAIModel', () => {
    it('应该正确导出streamAIModel函数', () => {
      expect(typeof streamAIModel).toBe('function');
    });
  });
});