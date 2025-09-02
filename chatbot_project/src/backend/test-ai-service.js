// 加载环境变量
require('dotenv').config();

console.log('检查环境变量...');
console.log('DASHSCOPE_API_KEY:', process.env.DASHSCOPE_API_KEY ? '已设置' : '未设置');

if (!process.env.DASHSCOPE_API_KEY) {
  console.error('错误: DASHSCOPE_API_KEY 未设置');
  process.exit(1);
}

console.log('初始化AI服务...');
const OpenAI = require('openai');

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

async function testAI() {
  try {
    console.log('调用AI服务...');
    const completion = await openai.chat.completions.create({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: '你好，请简单介绍一下自己' }
      ],
    });
    
    console.log('AI服务调用成功:');
    console.log(completion.choices[0].message.content.substring(0, 100) + '...');
  } catch (error) {
    console.error('AI服务调用失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testAI();