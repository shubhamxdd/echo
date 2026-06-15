import React, { useState, useEffect, useRef } from 'react';
import { HttpResponse, KeyValueItem } from '../../types';
import {
  Send,
  Sparkles,
  X,
  Trash2,
  Settings,
  Bot,
  Key,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface ChatSidebarProps {
  activeRequestMeta: {
    id: string | null;
    collectionId: string | null;
    name: string | null;
  };
  method: string;
  url: string;
  headers: KeyValueItem[];
  params: KeyValueItem[];
  bodyType: 'none' | 'raw' | 'json' | 'form';
  body: string;
  authType: 'none' | 'bearer' | 'basic' | 'apikey';
  authData: any;
  activeResponse: HttpResponse | null;
  activeEnvName: string;
  activeEnvVariables: KeyValueItem[];
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export function ChatSidebar({
  activeRequestMeta,
  method,
  url,
  headers,
  params,
  bodyType,
  body,
  authType,
  authData,
  activeResponse,
  activeEnvName,
  activeEnvVariables,
  onClose,
}: ChatSidebarProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [tempKey, setTempKey] = useState<string>('');
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API Key from local storage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('echo_gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setTempKey(savedKey);
    } else {
      setShowConfig(true);
    }

    // Load saved messages if any (per conversation)
    const savedMessages = localStorage.getItem('echo_chat_history');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (_) {}
    }
  }, []);

  // Save messages to local storage whenever history updates
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('echo_chat_history', JSON.stringify(messages));
    } else {
      localStorage.removeItem('echo_chat_history');
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempKey.trim()) return;
    localStorage.setItem('echo_gemini_api_key', tempKey.trim());
    setApiKey(tempKey.trim());
    setShowConfig(false);
    setErrorMsg(null);
  };

  const handleResetApiKey = () => {
    localStorage.removeItem('echo_gemini_api_key');
    setApiKey('');
    setTempKey('');
    setShowConfig(true);
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear your conversation history?')) {
      setMessages([]);
    }
  };

  const formatWorkspaceContext = (): string => {
    const activeHeaders = headers.filter((h) => h.enabled && h.key);
    const activeParams = params.filter((p) => p.enabled && p.key);

    let context = `\n\n[Active Workspace Context]`;
    context += `\n- Request Name: ${activeRequestMeta.name || 'Unsaved Request'}`;
    context += `\n- HTTP Method: ${method}`;
    context += `\n- Request URL: ${url || '(none)'}`;
    context += `\n- Active Environment: ${activeEnvName}`;
    if (activeEnvVariables.length > 0) {
      context += `\n- Env Variables defined: ${activeEnvVariables.map((v) => v.key).join(', ')}`;
    }

    if (activeHeaders.length > 0) {
      context += `\n- Request Headers: ${activeHeaders.map((h) => `${h.key}: ${h.value}`).join(', ')}`;
    }
    if (activeParams.length > 0) {
      context += `\n- Query Parameters: ${activeParams.map((p) => `${p.key}=${p.value}`).join('&')}`;
    }
    if (bodyType !== 'none') {
      context += `\n- Body Type: ${bodyType}`;
      context += `\n- Body: ${body.substring(0, 1000)}${body.length > 1000 ? '...' : ''}`;
    }
    if (authType !== 'none') {
      context += `\n- Auth Type: ${authType}`;
      if (authData) {
        context += `\n- Auth Details: ${JSON.stringify(authData)}`;
      }
    }

    if (activeResponse) {
      context += `\n\n[Active Response Context]`;
      context += `\n- Status Code: ${activeResponse.status} ${activeResponse.statusText || ''}`;
      context += `\n- Execution Time: ${activeResponse.duration_ms} ms`;
      if (activeResponse.error) {
        context += `\n- Response Error: ${activeResponse.error}`;
      } else {
        context += `\n- Response Size: ${activeResponse.body.length} bytes`;
        context += `\n- Response Body Sample: ${activeResponse.body.substring(0, 2000)}${
          activeResponse.body.length > 2000 ? '...' : ''
        }`;
      }
    } else {
      context += `\n- Response Status: (no request has been sent yet)`;
    }

    return context;
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const query = customPrompt || inputValue;
    if (!query.trim() || loading || !apiKey) return;

    setErrorMsg(null);
    const userMessage: ChatMessage = {
      role: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInputValue('');
    setLoading(true);

    try {
      // Build history for Gemini (alternating role payloads)
      // Format context block and attach it ONLY to the latest user prompt
      const context = formatWorkspaceContext();
      
      const contentsPayload = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      // Push latest user prompt containing active workspace details
      contentsPayload.push({
        role: 'user',
        parts: [{ text: query + context }],
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: contentsPayload,
            systemInstruction: {
              parts: [
                {
                  text: 'You are Echo AI, a context-aware developer assistant built into Echo (a desktop API client). You help developers test, write, and debug HTTP API requests. Always be concise, helpful, and provide code blocks or assertions with clean syntax. When asked to write assertions, refer to the Echo SavedRequest assertion model format.',
                },
              ],
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Request failed with code ${response.status}`);
      }

      const data = await response.json();
      const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!answerText) {
        throw new Error('Received an empty response from Gemini API.');
      }

      const modelMessage: ChatMessage = {
        role: 'model',
        text: answerText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred while calling the Gemini API.');
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    // Basic Markdown regex parser (safe, fast, zero-dependency)
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : '';
        const code = match ? match[2] : part.slice(3, -3);
        return (
          <div key={index} className="my-2.5 bg-zinc-950 rounded-md border border-zinc-800/80 overflow-hidden font-mono text-[11px] w-full">
            <div className="flex justify-between items-center bg-zinc-900/50 px-3 py-1.5 text-zinc-500 border-b border-zinc-850">
              <span className="text-[9px] uppercase font-bold text-zinc-400">{language || 'code'}</span>
              <button
                onClick={() => navigator.clipboard.writeText(code.trim())}
                className="text-[9px] hover:text-orange-400 transition-colors cursor-pointer font-medium"
              >
                Copy
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-zinc-300 select-text scrollbar-thin">
              <code>{code.trim()}</code>
            </pre>
          </div>
        );
      }

      const inlineParts = part.split(/(`[^`\n]+`)/g);
      return (
        <span key={index} className="whitespace-pre-line select-text text-zinc-200">
          {inlineParts.map((subPart, subIndex) => {
            if (subPart.startsWith('`') && subPart.endsWith('`')) {
              return (
                <code key={subIndex} className="px-1.5 py-0.5 bg-zinc-950 text-orange-400 rounded font-mono text-[11px] border border-zinc-850 mx-0.5">
                  {subPart.slice(1, -1)}
                </code>
              );
            }

            const boldParts = subPart.split(/(\*\*[^*]+\*\*)/g);
            return boldParts.map((boldPart, boldIndex) => {
              if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
                return <strong key={boldIndex} className="font-bold text-zinc-100">{boldPart.slice(2, -2)}</strong>;
              }
              return boldPart;
            });
          })}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 select-none">
      {/* Header bar */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
          <span className="font-semibold text-xs text-zinc-100">Echo AI Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-1 rounded hover:bg-zinc-800 cursor-pointer transition-colors ${
              showConfig ? 'text-orange-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="AI Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClearChat}
            disabled={messages.length === 0}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-350 cursor-pointer transition-colors"
            title="Close Assistant"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {showConfig ? (
          /* API Key Setup View */
          <div className="absolute inset-0 bg-zinc-900 p-5 flex flex-col justify-center items-center z-10 text-center select-text">
            <div className="w-10 h-10 bg-orange-600/10 rounded-full flex items-center justify-center text-orange-500 mb-3">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 mb-1">Gemini API Connection</h3>
            <p className="text-xs text-zinc-400 max-w-[240px] leading-relaxed mb-4">
              Echo inspects active endpoints to build tests, document payloads, and write mock scripts. Paste your key below to connect.
            </p>

            <form onSubmit={handleSaveApiKey} className="w-full max-w-[240px] space-y-3">
              <input
                type="password"
                placeholder="Paste Gemini API Key..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded-md px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-700 transition-colors text-center"
              />
              <button
                type="submit"
                disabled={!tempKey.trim()}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs py-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:hover:bg-orange-600"
              >
                Save & Connect
              </button>
            </form>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center gap-1 text-[10px] text-orange-400 hover:text-orange-300 transition-colors font-medium"
            >
              Get a Free Gemini API Key <ExternalLink className="w-2.5 h-2.5" />
            </a>

            {apiKey && (
              <button
                onClick={() => setShowConfig(false)}
                className="mt-8 text-[10px] text-zinc-500 hover:text-zinc-350 underline transition-colors cursor-pointer"
              >
                Go back to chat
              </button>
            )}
          </div>
        ) : null}

        {/* Chat message history list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
          {messages.length === 0 ? (
            /* Welcome / Onboarding UI */
            <div className="h-full flex flex-col justify-center items-center text-center p-4 select-text">
              <Bot className="w-8 h-8 text-zinc-650 mb-2.5 animate-bounce" />
              <h4 className="text-xs font-semibold text-zinc-300 mb-1">Echo Context AI</h4>
              <p className="text-[11px] text-zinc-500 max-w-[200px] leading-relaxed mb-4">
                Ask me to write HTTP checks, explain response schemas, or debug errors based on the active tab details!
              </p>
              <div className="w-full max-w-[220px] space-y-1.5 text-left">
                <span className="text-[10px] text-zinc-650 font-bold uppercase tracking-wider block pl-1">
                  Try asking:
                </span>
                <button
                  onClick={() => handleSendMessage('Generate standard assertions for this request')}
                  className="w-full text-left text-[10px] bg-zinc-950 border border-zinc-800/80 hover:border-orange-500/50 hover:bg-orange-950/5 text-zinc-400 hover:text-zinc-200 p-2 rounded-md transition-all cursor-pointer font-medium"
                >
                  "Generate response assertions..."
                </button>
                <button
                  onClick={() => handleSendMessage('Analyze the response body and document the schema')}
                  className="w-full text-left text-[10px] bg-zinc-950 border border-zinc-800/80 hover:border-orange-500/50 hover:bg-orange-950/5 text-zinc-400 hover:text-zinc-200 p-2 rounded-md transition-all cursor-pointer font-medium"
                >
                  "Analyze response body schema..."
                </button>
              </div>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isAi = m.role === 'model';
              return (
                <div key={idx} className={`flex ${isAi ? 'justify-start' : 'justify-end'} w-full`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                      isAi
                        ? 'bg-zinc-850/80 text-zinc-200 border border-zinc-800/60 rounded-tl-none font-sans w-full'
                        : 'bg-orange-650 text-white rounded-tr-none font-medium'
                    }`}
                  >
                    {isAi ? renderMarkdown(m.text) : <span className="select-text">{m.text}</span>}
                  </div>
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex justify-start w-full">
              <div className="bg-zinc-850/80 text-zinc-400 border border-zinc-800/60 rounded-lg rounded-tl-none px-3 py-2.5 text-xs flex items-center gap-2 font-medium">
                <RefreshCw className="w-3.5 h-3.5 text-orange-500 animate-spin" />
                <span>Echo AI is thinking...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-950/20 border border-red-500/30 rounded-md p-3 text-[11px] text-red-400 select-text">
              <p className="font-semibold mb-1">API Request Failed</p>
              <p className="leading-relaxed">{errorMsg}</p>
              <button
                onClick={handleResetApiKey}
                className="mt-2 text-[10px] text-orange-400 hover:underline font-bold cursor-pointer"
              >
                Change API Key
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Context Pill Helpers (only visible if there is active response/request) */}
        {!showConfig && (
          <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto no-scrollbar border-t border-zinc-800/50 bg-zinc-900/60 shrink-0">
            <button
              onClick={() => handleSendMessage('Write status code, duration, and JSON body assertions for this response')}
              disabled={loading || !activeResponse}
              className="shrink-0 text-[10px] bg-zinc-950 hover:bg-orange-950/10 border border-zinc-800/80 hover:border-orange-500/50 text-zinc-450 hover:text-zinc-200 py-1 px-2.5 rounded-full transition-all cursor-pointer disabled:opacity-20 disabled:hover:bg-zinc-950 disabled:hover:border-zinc-800/80 font-medium"
            >
              💡 Generate Assertions
            </button>
            <button
              onClick={() => handleSendMessage('Analyze response payload structure and explain what each field represents')}
              disabled={loading || !activeResponse}
              className="shrink-0 text-[10px] bg-zinc-950 hover:bg-orange-950/10 border border-zinc-800/80 hover:border-orange-500/50 text-zinc-450 hover:text-zinc-200 py-1 px-2.5 rounded-full transition-all cursor-pointer disabled:opacity-20 disabled:hover:bg-zinc-950 disabled:hover:border-zinc-800/80 font-medium"
            >
              📑 Explain Payload
            </button>
            <button
              onClick={() => handleSendMessage('Check this request and response to explain what the issue is, and how to fix it')}
              disabled={loading || !activeResponse}
              className="shrink-0 text-[10px] bg-zinc-950 hover:bg-orange-950/10 border border-zinc-800/80 hover:border-orange-500/50 text-zinc-450 hover:text-zinc-200 py-1 px-2.5 rounded-full transition-all cursor-pointer disabled:opacity-20 disabled:hover:bg-zinc-950 disabled:hover:border-zinc-800/80 font-medium"
            >
              🛠️ Explain Error
            </button>
            <button
              onClick={() => handleSendMessage('Write a quick JavaScript integration code snippet to call this endpoint')}
              disabled={loading || !url}
              className="shrink-0 text-[10px] bg-zinc-950 hover:bg-orange-950/10 border border-zinc-800/80 hover:border-orange-500/50 text-zinc-450 hover:text-zinc-200 py-1 px-2.5 rounded-full transition-all cursor-pointer disabled:opacity-20 disabled:hover:bg-zinc-950 disabled:hover:border-zinc-800/80 font-medium"
            >
              📝 Fetch Snippet
            </button>
          </div>
        )}

        {/* Input Bar */}
        {!showConfig && (
          <div className="p-3 border-t border-zinc-800 bg-zinc-900/80 shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder={apiKey ? "Ask Echo AI assistant..." : "Settings -> Add API Key"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={loading || !apiKey}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded-md py-2 pl-3 pr-10 text-xs text-zinc-200 placeholder-zinc-700 transition-colors"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputValue.trim() || !apiKey}
                className="absolute right-1.5 p-1 rounded hover:bg-zinc-800 text-zinc-450 hover:text-orange-500 transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-zinc-450 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
