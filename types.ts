export interface LLMConfig {
  model?: string;
  temperature?: number;
  topP?: number;
  systemPrompt?: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  nodeType: '大模型 (LLM)' | '代码 (Code)' | 'API 请求' | '判断逻辑 (Condition)' | '数据库' | '知识库' | '其他';
  description: string;
  rationale: string; // Why this node is needed
  llmConfig?: LLMConfig;
  codeSnippet?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING_WORKFLOW = 'GENERATING_WORKFLOW',
  CHATTING = 'CHATTING',
}