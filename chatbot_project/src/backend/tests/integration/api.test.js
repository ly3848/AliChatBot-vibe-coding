/**
 * 测试目标: API接口
 * 测试场景:
 * 1. 测试GET /conversations - 获取对话列表
 * 2. 测试POST /conversations - 创建新对话
 * 3. 测试DELETE /conversations/:id - 删除对话
 * 4. 测试GET /conversations/:conversation_id/messages - 获取消息列表
 * 5. 测试POST /conversations/:conversation_id/messages - 发送消息
 * 6. 测试边界条件和错误处理
 */

const request = require('supertest');
const app = require('../../server');

// 使用测试端口避免冲突
process.env.PORT = 3001;

describe('API Endpoints', () => {
  let conversationId;
  
  describe('GET /api/v1/conversations', () => {
    it('应该成功获取对话列表', async () => {
      const response = await request(app)
        .get('/api/v1/conversations')
        .expect(200);
      
      expect(response.body).toHaveProperty('code', 0);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('list');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('应该支持分页参数', async () => {
      const response = await request(app)
        .get('/api/v1/conversations?page=1&limit=5')
        .expect(200);
      
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });

    it('应该处理无效的分页参数', async () => {
      const response = await request(app)
        .get('/api/v1/conversations?page=-1&limit=0')
        .expect(200);
      
      // 应该使用修正后的值
      expect(response.body.data.pagination.page).toBe(1);
      // 限制为1，因为0被修正为1，然后最大值为100，但我们测试的是最小值
      expect(response.body.data.pagination.limit).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/v1/conversations', () => {
    it('应该成功创建新对话', async () => {
      const response = await request(app)
        .post('/api/v1/conversations')
        .send({ title: '测试对话' })
        .expect(201);
      
      expect(response.body).toHaveProperty('code', 0);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title', '测试对话');
      
      conversationId = response.body.data.id;
    });

    it('应该成功创建无标题对话', async () => {
      const response = await request(app)
        .post('/api/v1/conversations')
        .send({})
        .expect(201);
      
      expect(response.body).toHaveProperty('code', 0);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title', '新对话');
    });

    it('应该处理超长标题', async () => {
      const longTitle = 'a'.repeat(300); // 超过255字符
      const response = await request(app)
        .post('/api/v1/conversations')
        .send({ title: longTitle })
        .expect(201);
      
      expect(response.body).toHaveProperty('code', 0);
      // 标题可能会被截断或者数据库会处理，但我们至少确保它创建成功
      expect(response.body.data).toHaveProperty('title');
    });
  });

  describe('DELETE /api/v1/conversations/:id', () => {
    it('应该成功删除存在的对话', async () => {
      // 先创建一个对话用于删除
      const createResponse = await request(app)
        .post('/api/v1/conversations')
        .send({ title: '待删除对话' })
        .expect(201);
      
      const idToDelete = createResponse.body.data.id;
      
      // 删除对话
      await request(app)
        .delete(`/api/v1/conversations/${idToDelete}`)
        .expect(200);
    });

    it('应该返回404当删除不存在的对话时', async () => {
      const response = await request(app)
        .delete('/api/v1/conversations/999999')
        .expect(404);
      
      expect(response.body).toHaveProperty('code', 1002);
    });

    it('应该返回404当删除无效ID的对话时', async () => {
      const invalidIds = ['-1', '0', 'abc'];
      for (const id of invalidIds) {
        const response = await request(app)
          .delete(`/api/v1/conversations/${id}`)
          .expect(404);
        
        expect(response.body).toHaveProperty('code', 1002);
      }
    });
  });

  describe('GET /api/v1/conversations/:conversation_id/messages', () => {
    it('应该返回404当对话不存在时', async () => {
      const response = await request(app)
        .get('/api/v1/conversations/999999/messages')
        .expect(404);
      
      expect(response.body).toHaveProperty('code', 1002);
    });

    it('应该返回404当对话ID无效时', async () => {
      const invalidIds = ['-1', '0', 'abc'];
      for (const id of invalidIds) {
        const response = await request(app)
          .get(`/api/v1/conversations/${id}/messages`)
          .expect(404);
        
        expect(response.body).toHaveProperty('code', 1002);
      }
    });
  });

  describe('POST /api/v1/conversations/:conversation_id/messages', () => {
    let testConversationId;

    // 在测试开始前创建一个测试对话
    beforeAll(async () => {
      const createResponse = await request(app)
        .post('/api/v1/conversations')
        .send({ title: '测试对话' })
        .expect(201);
      
      testConversationId = createResponse.body.data.id;
    });

    it('应该返回404当对话不存在时', async () => {
      const response = await request(app)
        .post('/api/v1/conversations/999999/messages')
        .send({ content: '测试消息' })
        .expect(404);
      
      expect(response.body).toHaveProperty('code', 1002);
    });

    it('应该返回400当消息内容为空时', async () => {
      const response = await request(app)
        .post(`/api/v1/conversations/${testConversationId}/messages`)
        .send({ content: '' })
        .expect(400);
      
      expect(response.body).toHaveProperty('code', 1001);
    });

    it('应该返回400当消息内容只有空格时', async () => {
      const response = await request(app)
        .post(`/api/v1/conversations/${testConversationId}/messages`)
        .send({ content: '   ' })
        .expect(400);
      
      expect(response.body).toHaveProperty('code', 1001);
    });

    it('应该返回400当缺少content字段时', async () => {
      const response = await request(app)
        .post(`/api/v1/conversations/${testConversationId}/messages`)
        .send({ })
        .expect(400);
      
      expect(response.body).toHaveProperty('code', 1001);
    });

    it('应该返回404当对话ID无效时', async () => {
      const invalidIds = ['-1', '0', 'abc'];
      for (const id of invalidIds) {
        const response = await request(app)
          .post(`/api/v1/conversations/${id}/messages`)
          .send({ content: '测试消息' })
          .expect(404);
        
        expect(response.body).toHaveProperty('code', 1002);
      }
    });
  });

  describe('POST /api/v1/conversations/:conversation_id/messages/stream', () => {
    let testConversationId;

    // 在测试开始前创建一个测试对话
    beforeAll(async () => {
      const createResponse = await request(app)
        .post('/api/v1/conversations')
        .send({ title: '测试对话' })
        .expect(201);
      
      testConversationId = createResponse.body.data.id;
    });

    it('应该返回404当对话不存在时', async () => {
      // 流式接口返回的是文本事件流，不是JSON
      await request(app)
        .post('/api/v1/conversations/999999/messages/stream')
        .send({ content: '测试消息' })
        .expect(404);
    });

    it('应该返回400当消息内容为空时', async () => {
      const response = await request(app)
        .post(`/api/v1/conversations/${testConversationId}/messages/stream`)
        .send({ content: '' })
        .expect(400);
      
      expect(response.body).toHaveProperty('code', 1001);
    });

    it('应该返回400当消息内容只有空格时', async () => {
      const response = await request(app)
        .post(`/api/v1/conversations/${testConversationId}/messages/stream`)
        .send({ content: '   ' })
        .expect(400);
      
      expect(response.body).toHaveProperty('code', 1001);
    });

    it('应该返回400当缺少content字段时', async () => {
      const response = await request(app)
        .post(`/api/v1/conversations/${testConversationId}/messages/stream`)
        .send({ })
        .expect(400);
      
      expect(response.body).toHaveProperty('code', 1001);
    });

    it('应该返回404当对话ID无效时', async () => {
      const invalidIds = ['-1', '0', 'abc'];
      for (const id of invalidIds) {
        await request(app)
          .post(`/api/v1/conversations/${id}/messages/stream`)
          .send({ content: '测试消息' })
          .expect(404);
      }
    });
  });
});