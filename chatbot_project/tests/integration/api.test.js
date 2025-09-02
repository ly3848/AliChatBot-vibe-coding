/**
 * 测试目标: API接口
 * 测试场景:
 * 1. 测试GET /conversations - 获取对话列表
 * 2. 测试POST /conversations - 创建新对话
 * 3. 测试DELETE /conversations/:id - 删除对话
 * 4. 测试GET /conversations/:conversation_id/messages - 获取消息列表
 * 5. 测试POST /conversations/:conversation_id/messages - 发送消息
 */

const request = require('supertest');
const app = require('../../src/backend/server');

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
  });

  describe('GET /api/v1/conversations/:conversation_id/messages', () => {
    it('应该返回404当对话不存在时', async () => {
      const response = await request(app)
        .get('/api/v1/conversations/999999/messages')
        .expect(404);
      
      expect(response.body).toHaveProperty('code', 1002);
    });
  });

  describe('POST /api/v1/conversations/:conversation_id/messages', () => {
    it('应该返回404当对话不存在时', async () => {
      const response = await request(app)
        .post('/api/v1/conversations/999999/messages')
        .send({ content: '测试消息' })
        .expect(404);
      
      expect(response.body).toHaveProperty('code', 1002);
    });

    it('应该返回400当消息内容为空时', async () => {
      // 先创建一个对话
      const createResponse = await request(app)
        .post('/api/v1/conversations')
        .send({ title: '测试对话' })
        .expect(201);
      
      const testConversationId = createResponse.body.data.id;
      
      const response = await request(app)
        .post(`/api/v1/conversations/${testConversationId}/messages`)
        .send({ content: '' })
        .expect(400);
      
      expect(response.body).toHaveProperty('code', 1001);
    });
  });

  describe('POST /api/v1/conversations/:conversation_id/messages/stream', () => {
    it('应该返回404当对话不存在时', async () => {
      const response = await request(app)
        .post('/api/v1/conversations/999999/messages/stream')
        .send({ content: '测试消息' })
        .expect(404);
      
      expect(response.body).toHaveProperty('code', 1002);
    });

    it('应该返回400当消息内容为空时', async () => {
      // 先创建一个对话
      const createResponse = await request(app)
        .post('/api/v1/conversations')
        .send({ title: '测试对话' })
        .expect(201);
      
      const testConversationId = createResponse.body.data.id;
      
      const response = await request(app)
        .post(`/api/v1/conversations/${testConversationId}/messages/stream`)
        .send({ content: '' })
        .expect(400);
      
      expect(response.body).toHaveProperty('code', 1001);
    });
  });
});