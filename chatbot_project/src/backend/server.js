const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config();

// 验证关键环境变量是否已正确加载
if (!process.env.DASHSCOPE_API_KEY) {
    console.error('错误: DASHSCOPE_API_KEY 环境变量未设置，请检查 .env 文件');
    process.exit(1);
}

// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../frontend')));

// API 路由
app.use('/api/v1', require('./routes/conversations'));

// 基础路由 - 返回前端页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 404 错误处理
app.use((req, res) => {
  res.status(404).json({
    code: 1002,
    message: '请求的资源不存在',
    data: null
  });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 1003,
    message: '服务器内部错误',
    data: null
  });
});

// 仅在非测试环境下启动服务器
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
}

module.exports = app;