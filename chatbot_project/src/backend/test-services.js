const db = require('./config/database');
const { callAIModel } = require('./services/aiService');

// 测试数据库连接
console.log('测试数据库连接...');
db.get('SELECT count(*) as count FROM conversations', (err, row) => {
  if (err) {
    console.error('数据库查询失败:', err);
    process.exit(1);
  }
  
  console.log(`数据库连接成功，对话表中有 ${row.count} 条记录`);
  
  // 测试AI服务连接
  console.log('测试AI服务连接...');
  callAIModel([
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: '你好，请简单介绍一下自己' }
  ])
  .then(response => {
    console.log('AI服务连接成功，响应内容:');
    console.log(response.substring(0, 100) + '...');
    process.exit(0);
  })
  .catch(error => {
    console.error('AI服务调用失败:', error.message);
    process.exit(1);
  });
});