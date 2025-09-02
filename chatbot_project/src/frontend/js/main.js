// API基础URL
const API_BASE_URL = 'http://localhost:3000/api/v1';

// DOM元素
const elements = {
    historyList: document.getElementById('history-list'),
    chatMessages: document.getElementById('chat-messages'),
    messageInput: document.getElementById('message-input'),
    sendButton: document.getElementById('send-button'),
    newConversationButton: document.getElementById('new-conversation')
};

// 应用状态
let appState = {
    currentConversationId: null,
    conversations: []
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    loadConversations();
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    elements.sendButton.addEventListener('click', sendMessage);
    elements.messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    elements.newConversationButton.addEventListener('click', createNewConversation);
}

// 加载对话历史
async function loadConversations() {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations?page=1&limit=100`);
        const result = await response.json();
        
        if (result.code === 0) {
            appState.conversations = result.data.list;
            renderConversationHistory();
        }
    } catch (error) {
        console.error('加载对话历史失败:', error);
    }
}

// 渲染对话历史
function renderConversationHistory() {
    elements.historyList.innerHTML = '';
    
    appState.conversations.forEach(conversation => {
        const conversationElement = document.createElement('div');
        conversationElement.className = `history-item ${appState.currentConversationId == conversation.id ? 'active' : ''}`;
        conversationElement.innerHTML = `
            <div class="history-item-title" data-id="${conversation.id}">${conversation.title}</div>
            <button class="history-item-delete" data-id="${conversation.id}">×</button>
        `;
        
        conversationElement.querySelector('.history-item-title').addEventListener('click', () => {
            loadConversation(conversation.id);
        });
        
        conversationElement.querySelector('.history-item-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteConversation(conversation.id);
        });
        
        elements.historyList.appendChild(conversationElement);
    });
}

// 创建新对话
async function createNewConversation() {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: '新对话'
            })
        });
        
        const result = await response.json();
        
        if (result.code === 0) {
            appState.currentConversationId = result.data.id;
            appState.conversations.unshift(result.data);
            renderConversationHistory();
            clearChatMessages();
        }
    } catch (error) {
        console.error('创建新对话失败:', error);
    }
}

// 加载对话
async function loadConversation(conversationId) {
    try {
        appState.currentConversationId = conversationId;
        renderConversationHistory();
        clearChatMessages();
        
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`);
        const result = await response.json();
        
        if (result.code === 0) {
            result.data.forEach(message => {
                addMessageToChat(message.role, message.content, message.created_at);
            });
        }
    } catch (error) {
        console.error('加载对话失败:', error);
    }
}

// 删除对话
async function deleteConversation(conversationId) {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.code === 0) {
            // 从本地状态中移除对话
            appState.conversations = appState.conversations.filter(conv => conv.id != conversationId);
            
            // 如果删除的是当前对话，清空聊天区域
            if (appState.currentConversationId == conversationId) {
                appState.currentConversationId = null;
                clearChatMessages();
            }
            
            renderConversationHistory();
        }
    } catch (error) {
        console.error('删除对话失败:', error);
    }
}

// 发送消息
async function sendMessage() {
    const content = elements.messageInput.value.trim();
    
    if (!content) {
        return;
    }
    
    if (!appState.currentConversationId) {
        await createNewConversation();
    }
    
    // 添加用户消息到聊天界面
    const timestamp = new Date().toISOString();
    addMessageToChat('user', content, timestamp);
    
    // 清空输入框
    elements.messageInput.value = '';
    
    // 添加加载状态
    const loadingElement = addLoadingIndicator();
    
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${appState.currentConversationId}/messages/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });
        
        // 移除加载状态
        loadingElement.remove();
        
        if (response.ok) {
            // 添加助手消息容器
            const assistantMessageElement = addMessageToChat('assistant', '', new Date().toISOString());
            const contentElement = assistantMessageElement.querySelector('.message-content');
            
            // 处理流式响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let assistantContent = '';
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    break;
                }
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.substring(6);
                        
                        if (data === '[DONE]') {
                            // 流完成，更新对话列表
                            loadConversations();
                            return;
                        }
                        
                        try {
                            const parsed = JSON.parse(data);
                            
                            if (parsed.type === 'chunk') {
                                assistantContent += parsed.data.content;
                                contentElement.textContent = assistantContent;
                                scrollToBottom();
                            }
                        } catch (e) {
                            console.error('解析流数据失败:', e);
                        }
                    }
                }
            }
        } else {
            // 移除加载状态并显示错误消息
            loadingElement.remove();
            addMessageToChat('assistant', '抱歉，发送消息时出现了错误，请稍后重试。', new Date().toISOString());
        }
    } catch (error) {
        // 移除加载状态并显示错误消息
        loadingElement.remove();
        console.error('发送消息失败:', error);
        addMessageToChat('assistant', '抱歉，发送消息时出现了错误，请稍后重试。', new Date().toISOString());
    }
}

// 添加消息到聊天界面
function addMessageToChat(role, content, timestamp) {
    const messageElement = document.createElement('div');
    messageElement.className = `message-bubble ${role}`;
    
    const timeString = new Date(timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    messageElement.innerHTML = `
        <div class="message-content">${content}</div>
        <div class="message-time">${timeString}</div>
    `;
    
    elements.chatMessages.appendChild(messageElement);
    scrollToBottom();
    
    return messageElement;
}

// 添加加载指示器
function addLoadingIndicator() {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'message-bubble assistant';
    loadingElement.innerHTML = `
        <div class="message-content">
            <div class="loading"></div> AI助手正在思考...
        </div>
    `;
    
    elements.chatMessages.appendChild(loadingElement);
    scrollToBottom();
    
    return loadingElement;
}

// 清空聊天消息
function clearChatMessages() {
    elements.chatMessages.innerHTML = `
        <div class="message-welcome">
            <h2>欢迎使用智能问答系统</h2>
            <p>请输入您的问题，我将尽力为您解答。</p>
        </div>
    `;
}

// 滚动到底部
function scrollToBottom() {
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}