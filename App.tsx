import React, { useState, useCallback } from 'react';
import { createChatSession, generateWorkflowBreakdown } from './services/geminiService';
import { WorkflowStep, ChatMessage, AppStatus } from './types';
import { WorkflowList } from './components/WorkflowList';
import { ChatPanel } from './components/ChatPanel';
import { Chat, GenerateContentResponse } from '@google/genai';

const App: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Initialize chat session when workflow changes
  const initializeChat = useCallback((steps: WorkflowStep[]) => {
    const context = steps.map(s => 
        `节点 ${s.title} (${s.nodeType}): ${s.description}\n` +
        `作用: ${s.rationale}\n` +
        (s.llmConfig ? `LLM配置: Temp=${s.llmConfig.temperature}, Prompt="${s.llmConfig.systemPrompt}"\n` : '') +
        (s.codeSnippet ? `代码逻辑: 是\n` : '')
    ).join('\n---\n');

    const chat = createChatSession(context);
    setChatSession(chat);
    setChatMessages([{
      role: 'model',
      content: "我已经为你生成了工作流方案。你可以问我关于任何节点的配置细节，比如“为什么第一个节点的温度要设置成0.7？”或者“帮我修改一下第三步的代码”。",
      timestamp: Date.now()
    }]);
  }, []);

  const handleGenerateWorkflow = async () => {
    if (!goal.trim()) return;

    setStatus(AppStatus.GENERATING_WORKFLOW);
    setWorkflow([]); // Clear previous
    setIsChatOpen(false); // Close chat initially to focus on result

    try {
      const steps = await generateWorkflowBreakdown(goal);
      setWorkflow(steps);
      initializeChat(steps);
      setStatus(AppStatus.IDLE);
    } catch (error) {
      console.error("Failed to generate workflow", error);
      alert("生成工作流失败，请重试。");
      setStatus(AppStatus.IDLE);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!chatSession) return;

    // Add user message
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    
    setStatus(AppStatus.CHATTING);

    try {
      // Use streaming for better UX
      const result = await chatSession.sendMessageStream({ message: text });
      
      let fullResponse = "";
      // Create a placeholder message for the AI response
      setChatMessages(prev => [
        ...prev, 
        { role: 'model', content: '', timestamp: Date.now() }
      ]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const textChunk = c.text || "";
        fullResponse += textChunk;
        
        // Update the last message with accumulating text
        setChatMessages(prev => {
          const newHistory = [...prev];
          const lastMsg = newHistory[newHistory.length - 1];
          if (lastMsg.role === 'model') {
            lastMsg.content = fullResponse;
          }
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Chat error", error);
      setChatMessages(prev => [...prev, { role: 'model', content: "抱歉，遇到了一些连接问题，请稍后再试。", timestamp: Date.now() }]);
    } finally {
      setStatus(AppStatus.IDLE);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-full transition-all duration-300 ${isChatOpen ? 'mr-0 md:mr-0' : ''}`}>
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-5 flex justify-between items-center shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center">
                <span className="bg-indigo-600 text-white p-1 rounded mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                </span>
                工作流架构师
            </h1>
            <p className="text-slate-500 text-sm mt-0.5 ml-1">专业拆解需求，辅助 Coze/Dify 搭建</p>
          </div>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`md:hidden p-2 rounded-md ${isChatOpen ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto w-full">
            
            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 transition-all hover:shadow-md">
              <label htmlFor="goal" className="block text-sm font-medium text-slate-700 mb-2">
                你想搭建什么样的 AI 应用？
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  id="goal"
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="例如：帮我做一个自动搜集科技新闻并写成日报的 Bot"
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateWorkflow()}
                />
                <button
                  onClick={handleGenerateWorkflow}
                  disabled={status === AppStatus.GENERATING_WORKFLOW || !goal.trim()}
                  className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center min-w-[140px]"
                >
                  {status === AppStatus.GENERATING_WORKFLOW ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      思考中...
                    </>
                  ) : (
                    '拆解工作流'
                  )}
                </button>
              </div>
            </div>

            {/* Workflow List */}
            <div className="mb-8">
               <WorkflowList steps={workflow} />
            </div>

          </div>
        </main>
      </div>

      {/* Side Chat Panel - Responsive */}
      <div 
        className={`
          fixed inset-y-0 right-0 w-full md:w-[400px] bg-white z-20 transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none md:relative md:transform-none md:border-l md:border-slate-200
          ${isChatOpen || (workflow.length > 0 && window.innerWidth >= 768) ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          ${workflow.length === 0 ? 'md:hidden' : 'md:flex'}
        `}
      >
        {/* Mobile close button */}
        <button 
            onClick={() => setIsChatOpen(false)}
            className="md:hidden absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 z-30"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <ChatPanel 
            messages={chatMessages} 
            isThinking={status === AppStatus.CHATTING}
            onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default App;