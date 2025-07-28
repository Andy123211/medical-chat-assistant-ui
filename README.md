# 医疗预约助手聊天界面

## 项目概述

医疗预约助手是一个基于React的前端应用，旨在提供便捷的医疗咨询和预约服务。该应用通过聊天界面与用户交互，帮助用户解决健康问题、提供医疗建议、完成挂号预约等操作。

## 功能特点

- **智能对话**：与医疗智能助手进行自然语言交流
- **流式输出**：回复采用打字效果逐字显示，提供更好的用户体验
- **对话记忆**：在一轮对话中保持上下文记忆，实现连贯的交流
- **新对话功能**：支持一键开始新的对话，重置对话状态
- **响应式设计**：适配不同尺寸的设备屏幕
- **错误处理**：网络请求失败时提供友好的错误提示

## 技术栈

- **前端框架**：React 18
- **构建工具**：Vite
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **UI组件**：shadcn/ui
- **状态管理**：React Hooks
- **HTTP请求**：Fetch API

## 项目结构

```
medical-chat-assistant-fixed/
├── public/                 # 静态资源
│   └── favicon.svg         # 网站图标
├── src/                    # 源代码
│   ├── components/         # 组件
│   │   ├── ui/             # UI组件
│   │   └── theme-provider.tsx  # 主题提供者
│   ├── hooks/              # 自定义钩子
│   │   ├── use-toast.ts    # Toast钩子
│   │   └── use-mobile.tsx  # 移动设备检测钩子
│   ├── lib/                # 工具库
│   │   └── utils.ts        # 工具函数
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 入口文件
│   └── globals.css         # 全局样式
├── index.html              # HTML模板
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
└── tailwind.config.ts      # Tailwind配置
```

## 安装与运行

### 前提条件

- Node.js 16.0 或更高版本
- npm 7.0 或更高版本

### 安装依赖

```bash
cd medical-chat-assistant-ui
npm install
```

### 开发环境运行

```bash
npm run dev
```

应用将在 http://localhost:5173 启动。

### 构建生产版本

```bash
npm run build
```

构建后的文件将位于 `dist` 目录中。

### 预览生产版本

```bash
npm run preview
```

## 后端接口

应用通过以下API与后端通信：

- **聊天接口**：`/xiaozhi/chat`
  - 方法：POST
  - 请求体：
    ```json
    {
      "memoryId": 123,  // 对话记忆ID，0-1000之间的随机数
      "message": "用户输入的消息"
    }
    ```
  - 响应：
    ```json
    {
      "message": "后端返回的回复内容"
    }
    ```

## 部署

项目可以部署到任何支持静态网站的服务器。如果使用CloudStudio，可以通过以下步骤部署：

1. 构建项目：`npm run build`
2. 使用CloudStudio的部署工具部署`dist`目录
3. 配置服务器以将所有请求重定向到`index.html`

## 自定义配置

### 主题设置

应用默认使用浅色主题，可以通过修改`src/components/theme-provider.tsx`中的`defaultTheme`属性来更改默认主题。

### 后端API地址

如果需要更改后端API地址，请修改`vite.config.ts`中的代理配置：

```typescript
server: {
  proxy: {
    '/xiaozhi': {
      target: '你的后端API地址',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

