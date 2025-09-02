const OpenAI = require('openai');

// 验证API Key是否有效
function validateApiKey() {
    if (!process.env.DASHSCOPE_API_KEY) {
        throw new Error('API Key未配置，请检查环境变量DASHSCOPE_API_KEY');
    }
    
    // 验证API Key格式（以sk-开头）
    if (!process.env.DASHSCOPE_API_KEY.startsWith('sk-')) {
        throw new Error('API Key格式不正确，应以sk-开头');
    }
    
    return true;
}

// 初始化OpenAI客户端
const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

/**
 * 调用阿里百炼大模型API
 * @param {Array} messages - 对话历史消息
 * @param {string} model - 模型名称，默认为qwen-plus
 * @returns {Promise<string>} AI回复内容
 */
async function callAIModel(messages, model = 'qwen-plus') {
    try {
        // 验证API Key
        validateApiKey();
        
        const completion = await openai.chat.completions.create({
            model: model,
            messages: messages,
        });
        
        return completion.choices[0].message.content;
    } catch (error) {
        console.error('调用AI模型失败:', error);
        throw new Error('AI服务调用失败: ' + error.message);
    }
}

/**
 * 流式调用阿里百炼大模型API
 * @param {Array} messages - 对话历史消息
 * @param {string} model - 模型名称，默认为qwen-plus
 * @returns {Promise<ReadableStream>} 流式响应
 */
async function streamAIModel(messages, model = 'qwen-plus') {
    try {
        // 验证API Key
        validateApiKey();
        
        const stream = await openai.chat.completions.create({
            model: model,
            messages: messages,
            stream: true,
        });
        
        return stream;
    } catch (error) {
        console.error('流式调用AI模型失败:', error);
        throw new Error('AI服务流式调用失败: ' + error.message);
    }
}

module.exports = {
    callAIModel,
    streamAIModel
};