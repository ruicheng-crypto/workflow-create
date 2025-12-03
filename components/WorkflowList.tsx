import React from 'react';
import { WorkflowStep } from '../types';

interface WorkflowListProps {
  steps: WorkflowStep[];
}

export const WorkflowList: React.FC<WorkflowListProps> = ({ steps }) => {
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // Optional: Add a toast notification here
  };

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 opacity-50">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
        <p className="text-lg">暂无工作流方案。</p>
        <p className="text-sm">请在上方输入您的需求，开始搭建。</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative pb-10">
      {/* Connection Line */}
      <div className="absolute left-6 top-6 bottom-0 w-0.5 bg-slate-200 -z-10"></div>

      {steps.map((step, index) => (
        <div key={step.id} className="relative flex items-start group">
          {/* Number Node */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center text-indigo-600 font-bold z-10 shadow-sm group-hover:scale-110 transition-transform duration-200">
            {index + 1}
          </div>
          
          {/* Card Content */}
          <div className="ml-6 flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            
            {/* Header */}
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-lg font-bold text-slate-800">{step.title}</h3>
              <span className={`px-3 py-1 text-xs rounded-full font-medium border ${
                step.nodeType === '大模型 (LLM)' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                step.nodeType === '代码 (Code)' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                'bg-blue-100 text-blue-700 border-blue-200'
              }`}>
                {step.nodeType}
              </span>
            </div>

            <div className="p-5 space-y-4">
              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">功能描述</h4>
                <p className="text-slate-700 leading-relaxed text-sm">{step.description}</p>
              </div>

              {/* Rationale */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <span className="text-xs font-bold text-indigo-700 block mb-0.5">节点作用</span>
                        <p className="text-xs text-indigo-900/80 leading-relaxed">{step.rationale}</p>
                    </div>
                </div>
              </div>

              {/* LLM Parameters */}
              {step.nodeType === '大模型 (LLM)' && step.llmConfig && (
                <div className="mt-4 border border-purple-100 rounded-lg overflow-hidden">
                    <div className="bg-purple-50 px-4 py-2 text-xs font-semibold text-purple-800 border-b border-purple-100 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
                            <path fillRule="evenodd" d="M10 1c3.866 0 7 1.789 7 4 0 1.133-.816 2.13-2.147 2.895l.957 4.593a1 1 0 01-1.636.966l-2.91-1.745-2.91 1.745a1 1 0 01-1.636-.966l.957-4.593C2.816 7.13 2 6.133 2 5c0-2.211 3.134-4 7-4zm0 2c-2.73 0-5 1.163-5 2.5S7.27 8 10 8s5-1.163 5-2.5S12.73 3 10 3z" clipRule="evenodd" />
                        </svg>
                        模型配置建议
                    </div>
                    <div className="p-4 bg-white grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-slate-500 text-xs mb-1">Temperature</span>
                            <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">{step.llmConfig.temperature ?? 'Default'}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-xs mb-1">Top P</span>
                            <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">{step.llmConfig.topP ?? 'Default'}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="block text-slate-500 text-xs mb-1">System Prompt (系统提示词)</span>
                            <div className="bg-slate-50 p-3 rounded text-slate-700 text-sm italic border border-slate-100">
                                "{step.llmConfig.systemPrompt}"
                            </div>
                        </div>
                    </div>
                </div>
              )}

              {/* Code Snippet */}
              {step.codeSnippet && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase">推荐代码逻辑</h4>
                    <button 
                        onClick={() => handleCopyCode(step.codeSnippet || '')}
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center cursor-pointer font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                        复制
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed shadow-inner">
                    <code>{step.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* End Indicator */}
      <div className="flex items-center ml-0.5 relative">
         <div className="w-11 h-11 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-slate-400 z-10 ml-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M3 10a7 7 0 1114 0 7 7 0 01-14 0zm7-7a1 1 0 011 1v6.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 10.586V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
         </div>
         <span className="ml-7 text-sm font-medium text-slate-400">工作流结束</span>
      </div>
    </div>
  );
};