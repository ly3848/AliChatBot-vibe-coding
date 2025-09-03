# AliChatBot - 基于阿里百炼的智能聊天机器人

利用vibe coding方式，基于阿里百炼API的智能问答Web应用，支持多轮对话交互和对话历史管理。
本项目以分享vibe coding的使用方式为主，帮助新手快速上手vibe coding。

## 项目简介

AliChatBot 是一个基于阿里百炼API开发的智能聊天机器人系统，具有以下特性：

- 多轮对话交互：支持上下文关联的连续问答
- 对话管理：包含新开对话、历史记录查看和删除
- 流式响应：模拟AI助手的流式回答效果
- 响应式设计：适配桌面端和移动端

## 3.1 生成市场MRD文档
提示词：
```
我想开发一个智能问答web网页，它的主要功能是：
- 用户输入文字可以进行多轮问答
- 支持用户上传pdf、txt等常见文档，具备相关文档的解析功能
- 支持新开对话功能
- 支持历史记录查看功能
- 支持聊天页面分享功能
- 支持AI回答不满意，用户针对当前问题选择重新回答的功能
- 系统调用 阿里百炼的API进行推理，生成相关信息。”
请你作为产品经理，对该web页面进行需求分析，并输出一份
**详细需求分析报告**
，包括但不限于：

1. 产品概述
 （介绍产品的核心功能和用户目标）
2. 用户需求分析
 （目标用户群体、使用场景、核心需求）
3. 功能需求
 （详细拆解功能点、输入输出、API 交互方式等）
4. 关键业务流程
 （示例：用户输入数据 -> API计算 -> 结果展示）
5. 开发周期
 （建议的开发计划、MVP版本优先级）
 
 帮我将需求分析报告写在mrd.md
 ```

 ## 3.2 生成产品PRD文档
 提示词：
 ```
 接下来根据需求分析，按照最小MVP的版本，帮我写一份专业的产品需求（PRD）文档，包含：详细描述产品功能、业务流程、页面逻辑、交互细节和数据需求。 我会给你一张参考web设计图，请参考我给你的图片帮我完成需求文档。并输出到prd.md中
```

## 3.3 概要设计
提示词：
```
根据产品需求文档，生成 技术选型文档，架构设计图，数据库概念设计 (E-R图)。分别保存到本地
```

## 3.4 详细设计
提示词：
```
进入详细设计阶段，输出 《UIUX设计稿和原型》、《数据库物理模型（表结构）文档》、《API接口文档》并分别保存到本地。要求如下：

1. UI/UX 设计：
    - 用户体验(UX)设计： 绘制线框图（Wireframe），设计用户操作流程和信息架构。
    - 用户界面(UI)设计： 制作高保真视觉稿（Mockup），定义颜色、字体、图标等视觉风格。
    - 交互原型设计： 创建可交互的原型（Prototype），模拟真实的用户体验。
2. 前后端详细设计：
    - 前端： 组件划分、页面路由设计、状态管理方案。
    - 后端： 模块/服务内部的类图、核心算法、业务逻辑流程图。
3. 数据库与API设计：
    - 数据库表结构设计： 定义每个数据表的字段、类型、索引和约束。
    - API接口设计： 编写详细的API文档（如使用Swagger/OpenAPI），定义请求URL、方法（GET/POST）、请求参数、响应数据格式等。
```

## 3.5 写入代码
提示词：
```
新建项目文件夹，并在该文件夹中完成代码开发。开发过程中需要参考相关设计文档
```
需要从阿里云百炼获取API密钥, 然后输入到.env文件中。下一步提示词：

```
我将百炼的DASHSCOPE_API_KEY添加到了chatbot_project/backend/.env中，另外我给你传一段node.js的调用通以大模型示例代码，你将本项目替换成真实的AI服务

import OpenAI from "openai";

const openai = new OpenAI(
    {
        // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",apiKey: process.env.DASHSCOPE_API_KEY,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);

async function main() {
    const completion = await openai.chat.completions.create({
        model: "qwen-plus",  //此处以qwen-plus为例，可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/getting-started/modelsmessages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "你是谁？" }
        ],
    });
    console.log(JSON.stringify(completion))
}

main();
```

## 3.6 单元测试
提示词：
```
对整个项目进行单元测试，相关测试代码和测试报告保存到chatbot_project/tests中，要求：
1. 测试框架: `Jest` - 功能全面，自带断言、Mock和覆盖率报告。
2. HTTP测试库: `supertest` - 用于对NestJS的API端点进行集成测试。
3. 单元测试代码需要注明 测试目标、测试场景
4. 最后生成测试覆盖率报告，包含： % Stmts: 语句覆盖率、% Branch: 分支覆盖率 (if/else, switch等)、% Funcs: 函数覆盖率、% Lines: 行覆盖率
```
```
按照你的建议 将 % Stmts: 语句覆盖率、% Branch: 分支覆盖率 (if/else, switch等)、% Funcs: 函数覆盖率、% Lines: 行覆盖率的指标进一步提高，最后生成新的测试报告
```

## 3.7 开启项目
提示词：
```
开启整个项目服务，包括前端、后端、数据库
```
过程会遇到一些问题，直接把问题发给大模型让其解决，可以发一些截图例如：
```
为啥发送“你是谁”后，窗口回答“抱歉，发送消息时出现了错误，请稍后重试。”如附件的红框所示
```