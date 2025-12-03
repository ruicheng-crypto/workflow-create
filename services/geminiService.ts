import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WorkflowStep } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const WORKFLOW_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "节点名称 (例如：用户意图识别)" },
      nodeType: { 
        type: Type.STRING, 
        enum: ['大模型 (LLM)', '代码 (Code)', 'API 请求', '判断逻辑 (Condition)', '数据库', '知识库', '其他'],
        description: "Coze 工作流中的节点类型" 
      },
      description: { type: Type.STRING, description: "该节点功能的详细说明" },
      rationale: { type: Type.STRING, description: "解释为什么在工作流中需要这个节点，它解决了什么问题" },
      llmConfig: {
        type: Type.OBJECT,
        properties: {
          model: { type: Type.STRING, description: "推荐的模型 (如 Gemini 1.5 Pro, GPT-4o)" },
          temperature: { type: Type.NUMBER, description: "推荐的 Temperature 参数 (0.0 - 1.0)" },
          topP: { type: Type.NUMBER, description: "推荐的 Top P 参数 (0.0 - 1.0)" },
          systemPrompt: { type: Type.STRING, description: "如果是 LLM 节点，提供核心的 System Prompt 提示词建议" }
        },
        nullable: true,
        description: "仅当节点类型为 '大模型 (LLM)' 时填充此项"
      },
      codeSnippet: { 
        type: Type.STRING, 
        nullable: true, 
        description: "如果是 '代码 (Code)' 节点，提供具体的 JavaScript 或 Python 代码实现（例如轮询逻辑、数据处理）" 
      }
    },
    required: ["title", "nodeType", "description", "rationale"]
  }
};

export const generateWorkflowBreakdown = async (goal: string): Promise<WorkflowStep[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `用户想要在类似 Coze 的平台上搭建一个 AI Bot 或工作流来实现以下目标：“${goal}”。
      
      请你作为资深 AI 工作流架构师，将这个目标拆解为具体的、可执行的工作流节点。
      
      要求：
      1. 逻辑严密：节点之间要有清晰的流转逻辑。
      2. 参数具体：对于 LLM 节点，必须给出推荐的 Temperature, Top P 和核心提示词。
      3. 代码辅助：对于需要逻辑处理（如解析 JSON、轮询 API、计算）的环节，必须提供 JavaScript 代码片段。
      4. 解释清晰：解释清楚每个节点的作用。
      5. 语言：必须使用中文回复。`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: WORKFLOW_SCHEMA,
        systemInstruction: "你是一位精通 Coze、Dify 等平台的 AI 工作流架构师。你的任务是帮助用户从零搭建 AI 应用，提供从节点设计、参数调优到代码实现的全方位指导。",
      }
    });

    const text = response.text;
    if (!text) return [];

    const rawSteps = JSON.parse(text);
    
    // Add IDs for React keys
    return rawSteps.map((step: any, index: number) => ({
      ...step,
      id: `step-${Date.now()}-${index}`
    }));

  } catch (error) {
    console.error("Error generating workflow:", error);
    throw error;
  }
};

export const createChatSession = (existingContext: string) => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `你是一位乐于助人的 AI 工作流搭建助手。
      用户正在查看一个 AI 工作流的设计方案。
      
      当前工作流的上下文信息如下：
      ${existingContext}
      
      你的职责：
      1. 回答用户关于具体节点实现的疑问。
      2. 解释为什么要设置特定的参数（如 Temperature 为何设低）。
      3. 如果用户对代码有疑问，解释代码逻辑或提供修改建议。
      4. 始终使用中文回答，态度专业且亲切。`,
    }
  });
};