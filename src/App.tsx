import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean; // 标记消息是否正在流式输出
}

function App() {
  // 当前对话的memoryId，在一轮对话中保持不变，但新对话时会更新
  const [currentMemoryId, setCurrentMemoryId] = useState<number>(Math.floor(Math.random() * 1001));
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false); // 是否正在流式输出
  const [streamingText, setStreamingText] = useState(""); // 当前流式输出的文本
  const streamingIntervalRef = useRef<number | null>(null); // 用于模拟流式输出的定时器
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const initRef = useRef<boolean>(false); // 使用ref来跟踪初始化状态

  // 初始化对话
  useEffect(() => {
    // 确保只执行一次初始化
    if (!initRef.current) {
      initRef.current = true;
      console.log("开始初始化对话...");
      // 发送初始消息"你好"到后端
      sendInitialMessage();
    }
    
    // 清理函数，确保组件卸载时清除所有定时器
    return () => {
      if (streamingIntervalRef.current !== null) {
        clearInterval(streamingIntervalRef.current);
        streamingIntervalRef.current = null;
      }
    };
  }, []);  // 只在组件挂载时执行一次

  // 自动滚动到最新消息
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 模拟流式输出文本
  const simulateStreamingText = (fullText: string) => {
    setIsStreaming(true);
    let currentIndex = 0;
    const fullTextLength = fullText.length;
    setStreamingText("");
    
    // 创建一个空的机器人消息，用于流式输出
    const messageId = messages.length > 0 ? messages.length + 1 : 1;
    const streamingMessage: Message = {
      id: messageId,
      text: "",
      isUser: false,
      timestamp: new Date(),
      isStreaming: true
    };
    
    // 清空现有消息并添加新消息（仅用于初始化）
    if (messages.length === 0) {
      setMessages([streamingMessage]);
    } else {
      setMessages(prev => [...prev, streamingMessage]);
    }
    
    // 清除之前的定时器
    if (streamingIntervalRef.current !== null) {
      clearInterval(streamingIntervalRef.current);
    }
    
    // 设置定时器，模拟流式输出
    const intervalId = window.setInterval(() => {
      if (currentIndex < fullTextLength) {
        // 每次添加1-3个字符，模拟不同的打字速度
        const charsToAdd = Math.min(Math.floor(Math.random() * 3) + 1, fullTextLength - currentIndex);
        const nextChars = fullText.substring(currentIndex, currentIndex + charsToAdd);
        currentIndex += charsToAdd;
        
        setStreamingText(prev => prev + nextChars);
        
        // 更新消息列表中的流式消息
        setMessages(prev => {
          const updatedMessages = [...prev];
          const lastMessageIndex = updatedMessages.length - 1;
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            text: fullText.substring(0, currentIndex)
          };
          return updatedMessages;
        });
      } else {
        // 流式输出完成
        clearInterval(intervalId);
        streamingIntervalRef.current = null;
        setIsStreaming(false);
        
        // 更新消息，移除流式标记
        setMessages(prev => {
          const updatedMessages = [...prev];
          const lastMessageIndex = updatedMessages.length - 1;
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            isStreaming: false
          };
          return updatedMessages;
        });
      }
    }, 30); // 每30毫秒更新一次
    
    streamingIntervalRef.current = intervalId;
  };

  // 发送初始消息到后端
  const sendInitialMessage = async () => {
    // 如果已经有消息，说明已经初始化过，不再重复发送
    if (messages.length > 0) {
      console.log("已经有消息，跳过初始化");
      return;
    }
    
    setIsLoading(true);

    try {
      // 构建请求参数
      const requestData = {
        memoryId: currentMemoryId,
        message: "你好"
      };
      
      console.log("发送初始数据:", JSON.stringify(requestData));
      
      const response = await fetch("/xiaozhi/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error("网络请求失败");
      }

      let responseText;
      let data;
      
      try {
        // 尝试解析JSON响应
        responseText = await response.text();
        console.log("收到初始响应:", responseText);
        
        try {
          data = JSON.parse(responseText);
          console.log("解析为JSON:", data);
          responseText = data.message || data.response || responseText;
        } catch (jsonError) {
          // 如果不是有效的JSON，直接使用文本响应
          console.log("响应不是有效的JSON，使用原始文本");
        }
      } catch (error) {
        console.error("读取响应失败", error);
        throw error;
      }

      // 使用流式输出显示回复
      const finalText = responseText || "";
      if (finalText) {
        // 直接设置消息，不使用流式输出
        const botMessage: Message = {
          id: 1,
          text: finalText,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages([botMessage]);
      } else {
        // 如果没有收到响应，不显示任何消息
        console.log("未收到后端响应，不显示欢迎消息");
      }
    } catch (error) {
      console.error("初始化对话失败", error);
      // 如果初始化失败，不显示任何默认消息
      console.log("初始化失败，不显示默认欢迎消息");
    } finally {
      setIsLoading(false);
    }
  };

  // 发送消息到后端
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    console.log(`发送请求，memoryId: ${currentMemoryId}, 消息: ${inputMessage}`);

    // 添加用户消息到聊天
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // 构建请求参数
      const requestData = {
        memoryId: currentMemoryId, // 使用当前对话的固定memoryId
        message: inputMessage // 用户输入的消息
      };
      
      console.log("发送数据:", JSON.stringify(requestData));
      
      const response = await fetch("/xiaozhi/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error("网络请求失败");
      }

      let responseText;
      let data;
      
      try {
        // 尝试解析JSON响应
        responseText = await response.text();
        console.log("收到原始响应:", responseText);
        
        try {
          data = JSON.parse(responseText);
          console.log("解析为JSON:", data);
          responseText = data.message || data.response || responseText;
        } catch (jsonError) {
          // 如果不是有效的JSON，直接使用文本响应
          console.log("响应不是有效的JSON，使用原始文本");
        }
      } catch (error) {
        console.error("读取响应失败", error);
        throw error;
      }

      // 使用流式输出显示回复
      const finalText = responseText || "抱歉，我没有获取到有效回复";
      simulateStreamingText(finalText);
    } catch (error) {
      console.error("发送消息失败", error);
      toast({
        title: "发送失败",
        description: "无法连接到服务器，请检查后端服务是否运行",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 开始新对话
  const startNewConversation = () => {
    // 生成新的memoryId
    const newMemoryId = Math.floor(Math.random() * 1001);
    setCurrentMemoryId(newMemoryId);
    // 重置消息列表
    setMessages([]);
    // 重置初始化状态，触发useEffect重新发送初始消息
    initRef.current = false;
    
    console.log("开始新对话，新的memoryId:", newMemoryId);
    
    // 手动触发初始化
    sendInitialMessage();
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ThemeProvider defaultTheme="light">
      <div className="flex flex-col h-screen bg-slate-50">
        {/* 顶部导航栏 */}
        <header className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                <span className="text-white font-bold">医</span>
              </div>
              <h1 className="text-xl font-semibold text-slate-800">医疗预约助手</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-slate-600"
              onClick={startNewConversation}
            >
              <RefreshCw size={16} />
              <span>新对话</span>
            </Button>
          </div>
        </header>

        {/* 聊天区域 */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <Card className={`max-w-[80%] md:max-w-[70%] p-3 ${
                    message.isUser 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border border-slate-200'
                  }`}>
                    <div className="text-sm md:text-base">
                      {message.text}
                      {message.isStreaming && (
                        <span className="inline-block w-1 h-4 ml-1 bg-blue-500 animate-pulse"></span>
                      )}
                    </div>
                    <div className={`text-xs mt-1 text-right ${
                      message.isUser ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </Card>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* 输入区域 */}
        <div className="bg-white border-t border-slate-200 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Input
                placeholder="请输入您的问题..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </Button>
            </div>
            <div className="text-xs text-center mt-2 text-slate-400">
              医疗预约助手随时为您服务，请详细描述您的需求
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;