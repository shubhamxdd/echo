import React, { useState, useEffect, useRef } from 'react';
import { HttpResponse, KeyValueItem } from '../../types';
import { fetch } from '@tauri-apps/plugin-http';
import { useAlertDialog } from '../common/AlertDialog';
import ReactMarkdown from 'react-markdown';
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
  Edit2,
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

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: number;
}

type AIProvider = 'gemini' | 'openai' | 'openrouter' | 'custom';

const getDefaultModel = (p: AIProvider): string => {
  switch (p) {
    case 'gemini':
      return 'gemini-2.5-flash';
    case 'openai':
      return 'gpt-4o-mini';
    case 'openrouter':
      return 'google/gemini-2.5-flash';
    case 'custom':
      return 'llama3';
    default:
      return '';
  }
};

const getDefaultBaseUrl = (p: AIProvider): string => {
  switch (p) {
    case 'gemini':
      return '';
    case 'openai':
      return 'https://api.openai.com/v1';
    case 'openrouter':
      return 'https://openrouter.ai/api/v1';
    case 'custom':
      return 'http://localhost:11434/v1';
    default:
      return '';
  }
};

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
  const { showConfirm } = useAlertDialog();

  // Active Running Config
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [model, setModel] = useState<string>('gemini-2.5-flash');
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');

  // Temp Form Config
  const [tempProvider, setTempProvider] = useState<AIProvider>('gemini');
  const [tempModel, setTempModel] = useState<string>('gemini-2.5-flash');
  const [tempBaseUrl, setTempBaseUrl] = useState<string>('');
  const [tempApiKey, setTempApiKey] = useState<string>('');

  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Multi-Chat Sessions State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [editTitleValue, setEditTitleValue] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const preventSaveRef = useRef<boolean>(false);

  // Derived Active Session Details
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  // Load configuration and chat sessions from local storage on mount
  useEffect(() => {
    // 1. Load AI Config
    const savedProvider = (localStorage.getItem('echo_ai_provider') as AIProvider) || 'gemini';
    const savedModel = localStorage.getItem(`echo_ai_model_${savedProvider}`) || getDefaultModel(savedProvider);
    const savedBaseUrl = localStorage.getItem(`echo_ai_url_${savedProvider}`) || getDefaultBaseUrl(savedProvider);
    const savedKey = localStorage.getItem(`echo_ai_key_${savedProvider}`) || '';

    setProvider(savedProvider);
    setTempProvider(savedProvider);
    setModel(savedModel);
    setTempModel(savedModel);
    setBaseUrl(savedBaseUrl);
    setTempBaseUrl(savedBaseUrl);
    setApiKey(savedKey);
    setTempApiKey(savedKey);

    if (!savedKey && savedProvider !== 'custom') {
      setShowConfig(true);
    }

    // 2. Load Chat Sessions
    const savedSessions = localStorage.getItem('echo_chat_sessions');
    let parsedSessions: ChatSession[] = [];
    if (savedSessions) {
      try {
        parsedSessions = JSON.parse(savedSessions);
      } catch (_) {}
    }

    // Fallback if no sessions exist
    if (parsedSessions.length === 0) {
      const initialId = crypto.randomUUID();
      parsedSessions = [{
        id: initialId,
        title: 'New Chat',
        messages: [],
        created_at: Date.now()
      }];
    }

    setSessions(parsedSessions);

    // 3. Load Active Session ID
    const savedActiveId = localStorage.getItem('echo_active_chat_id');
    const isValidActiveId = parsedSessions.some(s => s.id === savedActiveId);
    setActiveSessionId(isValidActiveId && savedActiveId ? savedActiveId : parsedSessions[0].id);
  }, []);

  // Save sessions to local storage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('echo_chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Save active session ID
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('echo_active_chat_id', activeSessionId);
    }
    scrollToBottom();
  }, [activeSessionId]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleProviderChange = (newP: AIProvider) => {
    setTempProvider(newP);
    
    const defaultModel = localStorage.getItem(`echo_ai_model_${newP}`) || getDefaultModel(newP);
    const defaultUrl = localStorage.getItem(`echo_ai_url_${newP}`) || getDefaultBaseUrl(newP);
    const savedKey = localStorage.getItem(`echo_ai_key_${newP}`) || '';

    setTempModel(defaultModel);
    setTempBaseUrl(defaultUrl);
    setTempApiKey(savedKey);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();

    localStorage.setItem('echo_ai_provider', tempProvider);
    localStorage.setItem(`echo_ai_model_${tempProvider}`, tempModel.trim());
    localStorage.setItem(`echo_ai_url_${tempProvider}`, tempBaseUrl.trim());
    localStorage.setItem(`echo_ai_key_${tempProvider}`, tempApiKey.trim());

    setProvider(tempProvider);
    setModel(tempModel.trim());
    setBaseUrl(tempBaseUrl.trim());
    setApiKey(tempApiKey.trim());

    setShowConfig(false);
    setErrorMsg(null);
  };

  const handleResetConfig = () => {
    setShowConfig(true);
  };

  // Multi-Chat Helper Actions
  const handleStartRename = () => {
    if (activeSession) {
      preventSaveRef.current = false;
      setEditTitleValue(activeSession.title);
      setIsEditingTitle(true);
    }
  };

  const handleSaveTitle = () => {
    if (!editTitleValue.trim()) {
      setIsEditingTitle(false);
      return;
    }
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: editTitleValue.trim(),
          };
        }
        return s;
      })
    );
    setIsEditingTitle(false);
  };

  const handleCreateSession = () => {
    const newId = crypto.randomUUID();
    const newSession: ChatSession = {
      id: newId,
      title: `Chat ${sessions.length + 1}`,
      messages: [],
      created_at: Date.now()
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setErrorMsg(null);
  };

  const handleDeleteSession = async (id: string) => {
    const confirmed = await showConfirm(
      'Are you sure you want to permanently delete this chat session and all its messages?',
      'Delete Chat Session',
      'Delete'
    );
    if (confirmed) {
      const updated = sessions.filter(s => s.id !== id);
      if (updated.length === 0) {
        const initialId = crypto.randomUUID();
        setSessions([{
          id: initialId,
          title: 'New Chat',
          messages: [],
          created_at: Date.now()
        }]);
        setActiveSessionId(initialId);
      } else {
        setSessions(updated);
        if (activeSessionId === id) {
          setActiveSessionId(updated[0].id);
        }
      }
      setErrorMsg(null);
    }
  };

  const addMessageToActiveSession = (msg: ChatMessage) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const updatedMessages = [...s.messages, msg];

          // Auto-rename chat title if it's the first user message
          let updatedTitle = s.title;
          if (s.title === 'New Chat' || s.title.startsWith('Chat ')) {
            const firstUserMsg = updatedMessages.find((m) => m.role === 'user');
            if (firstUserMsg) {
              updatedTitle =
                firstUserMsg.text.substring(0, 22) +
                (firstUserMsg.text.length > 22 ? '...' : '');
            }
          }

          return {
            ...s,
            title: updatedTitle,
            messages: updatedMessages,
          };
        }
        return s;
      })
    );
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
    if (!query.trim() || loading) return;
    if (!apiKey && provider !== 'custom') return;

    setErrorMsg(null);
    const userMessage: ChatMessage = {
      role: 'user',
      text: query,
      timestamp: Date.now(),
    };

    addMessageToActiveSession(userMessage);
    if (!customPrompt) setInputValue('');
    setLoading(true);

    try {
      const context = formatWorkspaceContext();
      let answerText = '';

      if (provider === 'gemini') {
        // --- Gemini Native API Format ---
        const contentsPayload = messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        }));

        contentsPayload.push({
          role: 'user',
          parts: [{ text: query + context }],
        });

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
        answerText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        // --- OpenAI Compatible API Format (OpenAI, OpenRouter, Custom) ---
        const messagesPayload = [
          {
            role: 'system',
            content: 'You are Echo AI, a context-aware developer assistant built into Echo (a desktop API client). You help developers test, write, and debug HTTP API requests. Always be concise, helpful, and provide code blocks or assertions with clean syntax. When asked to write assertions, refer to the Echo SavedRequest assertion model format.',
          },
          ...messages.map((m) => ({
            role: m.role === 'model' ? 'assistant' : 'user',
            content: m.text,
          })),
          {
            role: 'user',
            content: query + context,
          },
        ];

        const headersObj: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (apiKey) {
          headersObj['Authorization'] = `Bearer ${apiKey}`;
          headersObj['Authentication'] = `Bearer ${apiKey}`;
          headersObj['api-key'] = apiKey;
          headersObj['x-api-key'] = apiKey;
        }

        if (provider === 'openrouter') {
          headersObj['HTTP-Referer'] = 'http://localhost:1420';
          headersObj['X-Title'] = 'Echo Client';
        }

        const endpointUrl = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

        const response = await fetch(endpointUrl, {
          method: 'POST',
          headers: headersObj,
          body: JSON.stringify({
            model: model,
            messages: messagesPayload,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Request failed with code ${response.status}`);
        }

        const data = await response.json();
        answerText = data.choices?.[0]?.message?.content || '';
      }

      if (!answerText) {
        throw new Error('Received an empty response from the AI provider.');
      }

      const modelMessage: ChatMessage = {
        role: 'model',
        text: answerText,
        timestamp: Date.now(),
      };

      addMessageToActiveSession(modelMessage);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred while communicating with the AI provider.');
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    return (
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="text-[11.5px] text-zinc-200 leading-relaxed mb-2 last:mb-0 select-text">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 text-[11px] text-zinc-200 space-y-1 mb-2 select-text">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 text-[11px] text-zinc-200 space-y-1 mb-2 select-text">{children}</ol>,
          li: ({ children }) => <li className="text-[11px] text-zinc-200 select-text">{children}</li>,
          strong: ({ children }) => <strong className="font-bold text-zinc-100">{children}</strong>,
          em: ({ children }) => <em className="italic text-zinc-300">{children}</em>,
          h1: ({ children }) => <h1 className="text-xs font-bold text-zinc-100 mt-3 mb-1 select-text">{children}</h1>,
          h2: ({ children }) => <h2 className="text-[11px] font-bold text-zinc-150 mt-2.5 mb-1 select-text">{children}</h2>,
          h3: ({ children }) => <h3 className="text-[10px] font-bold text-zinc-200 mt-2 mb-0.5 select-text">{children}</h3>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-350 hover:underline cursor-pointer inline-flex items-center gap-0.5">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2 rounded border border-zinc-800 max-w-full">
              <table className="w-full border-collapse text-[10px] text-zinc-350">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-zinc-950 text-zinc-200 font-bold border-b border-zinc-800">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-zinc-800/40">{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => <th className="px-2 py-1 text-left border-r border-zinc-800 last:border-r-0 font-semibold">{children}</th>,
          td: ({ children }) => <td className="px-2 py-1 border-r border-zinc-800 last:border-r-0 text-zinc-300 font-normal">{children}</td>,
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeVal = String(children).replace(/\n$/, '');
            const isInline = !match && !codeVal.includes('\n') && codeVal.length < 100;
            
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 bg-zinc-950 text-orange-400 rounded font-mono text-[10.5px] border border-zinc-850 mx-0.5" {...props}>
                  {codeVal}
                </code>
              );
            }

            return (
              <div className="my-2 bg-zinc-950 rounded-md border border-zinc-800/80 overflow-hidden font-mono text-[11px] w-full">
                <div className="flex justify-between items-center bg-zinc-900/50 px-3 py-1 text-zinc-500 border-b border-zinc-850">
                  <span className="text-[9px] uppercase font-bold text-zinc-400">{match ? match[1] : 'code'}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(codeVal)}
                    className="text-[9px] hover:text-orange-400 transition-colors cursor-pointer font-medium"
                  >
                    Copy
                  </button>
                </div>
                <pre className="p-2.5 overflow-x-auto text-zinc-300 select-text scrollbar-thin">
                  <code>{codeVal}</code>
                </pre>
              </div>
            );
          }
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  const hasConfiguredKey = () => {
    if (provider === 'custom') return true;
    return !!apiKey;
  };

  const getProviderLink = () => {
    switch (tempProvider) {
      case 'gemini':
        return 'https://aistudio.google.com/app/apikey';
      case 'openai':
        return 'https://platform.openai.com/api-keys';
      case 'openrouter':
        return 'https://openrouter.ai/keys';
      default:
        return null;
    }
  };

  const getProviderLinkText = () => {
    switch (tempProvider) {
      case 'gemini':
        return 'Get Gemini API Key';
      case 'openai':
        return 'Get OpenAI API Key';
      case 'openrouter':
        return 'Get OpenRouter API Key';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 select-none">
      {/* Header bar */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
        <div className="flex items-center gap-1.5 overflow-hidden flex-1 mr-2">
          <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
          {isEditingTitle ? (
            <input
              type="text"
              value={editTitleValue}
              onChange={(e) => setEditTitleValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveTitle();
                } else if (e.key === 'Escape') {
                  preventSaveRef.current = true;
                  setIsEditingTitle(false);
                  setTimeout(() => {
                    preventSaveRef.current = false;
                  }, 100);
                }
              }}
              onBlur={() => {
                if (!preventSaveRef.current) {
                  handleSaveTitle();
                }
              }}
              className="bg-zinc-950 text-[11px] text-zinc-100 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded px-1.5 py-0.5 w-full max-w-[110px]"
              autoFocus
            />
          ) : (
            <>
              <select
                value={activeSessionId}
                onChange={(e) => {
                  setActiveSessionId(e.target.value);
                  setErrorMsg(null);
                  setIsEditingTitle(false);
                }}
                className="bg-transparent text-[11px] text-zinc-100 border-none outline-none focus:ring-0 truncate cursor-pointer font-semibold py-0.5 max-w-[110px]"
                title="Switch Chat Session"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id} className="bg-zinc-900 text-zinc-350">
                    {s.title}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStartRename}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors shrink-0"
                title="Rename Chat Session"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </>
          )}
          <button
            onClick={handleCreateSession}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors shrink-0"
            title="New Chat Session"
          >
            <span className="text-xs font-bold font-mono text-zinc-400 hover:text-orange-400">+</span>
          </button>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
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
            onClick={() => handleDeleteSession(activeSessionId)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-red-400 cursor-pointer transition-colors"
            title="Delete Current Chat"
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
          /* Multi-Provider Setup View */
          <div className="absolute inset-0 bg-zinc-900 p-5 flex flex-col justify-start items-center z-10 overflow-y-auto select-text scrollbar-thin">
            <div className="w-9 h-9 bg-orange-600/10 rounded-full flex items-center justify-center text-orange-500 mb-2 mt-4 shrink-0">
              <Key className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 mb-1 shrink-0">AI Assistant Settings</h3>
            <p className="text-[11px] text-zinc-400 max-w-[240px] leading-relaxed mb-4 text-center shrink-0">
              Connect Echo to your preferred AI model to automatically build tests, check schemas, and draft script helpers.
            </p>

            <form onSubmit={handleSaveConfig} className="w-full max-w-[240px] space-y-3">
              {/* Provider Selector */}
              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider pl-0.5">Provider</label>
                <select
                  value={tempProvider}
                  onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded-md px-3 py-1.5 text-xs text-zinc-200 cursor-pointer"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openrouter">OpenRouter (Llama/Claude/etc.)</option>
                  <option value="openai">OpenAI (GPT-4o/mini)</option>
                  <option value="custom">Custom (Ollama/Groq/etc.)</option>
                </select>
              </div>

              {/* Custom Base URL (visible only for custom) */}
              {tempProvider === 'custom' && (
                <div className="space-y-1 text-left animate-fadeIn">
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider pl-0.5">Base URL</label>
                  <input
                    type="text"
                    placeholder="e.g. http://localhost:11434/v1"
                    value={tempBaseUrl}
                    onChange={(e) => setTempBaseUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded-md px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-700"
                  />
                </div>
              )}

              {/* Model Name */}
              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider pl-0.5">Model Name</label>
                <input
                  type="text"
                  placeholder="e.g. gpt-4o-mini"
                  value={tempModel}
                  onChange={(e) => setTempModel(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded-md px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-700"
                />
              </div>

              {/* API Key */}
              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider pl-0.5">
                  API Key {tempProvider === 'custom' && '(Optional)'}
                </label>
                <input
                  type="password"
                  placeholder={tempProvider === 'custom' ? 'No key required' : 'Enter API Key...'}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded-md px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-700"
                />
              </div>

              <button
                type="submit"
                disabled={!tempApiKey.trim() && tempProvider !== 'custom'}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs py-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:hover:bg-orange-600 mt-2"
              >
                Save & Connect
              </button>
            </form>

            {getProviderLink() && (
              <a
                href={getProviderLink()!}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center gap-1 text-[10px] text-orange-400 hover:text-orange-300 transition-colors font-medium shrink-0"
              >
                {getProviderLinkText()} <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}

            {hasConfiguredKey() && (
              <button
                onClick={() => setShowConfig(false)}
                className="mt-6 text-[10px] text-zinc-500 hover:text-zinc-350 underline transition-colors cursor-pointer shrink-0 pb-4"
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
                  className="w-full text-left text-[10px] bg-zinc-950 border border-zinc-800/80 hover:border-orange-500/50 hover:bg-orange-950/5 text-zinc-450 hover:text-zinc-200 p-2 rounded-md transition-all cursor-pointer font-medium"
                >
                  "Generate response assertions..."
                </button>
                <button
                  onClick={() => handleSendMessage('Analyze the response body and document the schema')}
                  className="w-full text-left text-[10px] bg-zinc-950 border border-zinc-800/80 hover:border-orange-500/50 hover:bg-orange-950/5 text-zinc-450 hover:text-zinc-200 p-2 rounded-md transition-all cursor-pointer font-medium"
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
                onClick={handleResetConfig}
                className="mt-2 text-[10px] text-orange-400 hover:underline font-bold cursor-pointer"
              >
                Change API Settings
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Context Pill Helpers (only visible if configuration is valid) */}
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
                placeholder={hasConfiguredKey() ? "Ask Echo AI assistant..." : "Settings -> Add API Key"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={loading || !hasConfiguredKey()}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded-md py-2 pl-3 pr-10 text-xs text-zinc-200 placeholder-zinc-700 transition-colors"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputValue.trim() || !hasConfiguredKey()}
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
