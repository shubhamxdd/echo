import { useState } from 'react';
import { KeyValueItem } from '../../types';
import { UrlBar } from './UrlBar';
import { AuthEditor } from './AuthEditor';
import { BodyEditor } from './BodyEditor';
import { KeyValueEditor } from '../common/KeyValueEditor';

interface RequestPanelProps {
  method: string;
  onMethodChange: (method: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  
  headers: KeyValueItem[];
  onHeadersChange: (headers: KeyValueItem[]) => void;
  
  params: KeyValueItem[];
  onParamsChange: (params: KeyValueItem[]) => void;
  
  bodyType: 'none' | 'raw' | 'json' | 'form';
  onBodyTypeChange: (type: 'none' | 'raw' | 'json' | 'form') => void;
  body: string;
  onBodyChange: (body: string) => void;
  
  authType: 'none' | 'bearer' | 'basic' | 'apikey';
  onAuthTypeChange: (type: 'none' | 'bearer' | 'basic' | 'apikey') => void;
  authData: any;
  onAuthDataChange: (data: any) => void;
  
  onSend: () => void;
  onSave: () => void;
  loading: boolean;
}

export function RequestPanel({
  method,
  onMethodChange,
  url,
  onUrlChange,
  headers,
  onHeadersChange,
  params,
  onParamsChange,
  bodyType,
  onBodyTypeChange,
  body,
  onBodyChange,
  authType,
  onAuthTypeChange,
  authData,
  onAuthDataChange,
  onSend,
  onSave,
  loading,
}: RequestPanelProps) {
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth'>('params');

  const getActiveCount = (items: KeyValueItem[]) => {
    return items.filter((item) => item.enabled && item.key.trim() !== '').length;
  };

  const paramsCount = getActiveCount(params);
  const headersCount = getActiveCount(headers);
  const isBodyActive = bodyType !== 'none';
  const isAuthActive = authType !== 'none';

  return (
    <div className="flex flex-col h-full bg-zinc-900/10 p-4 gap-3 overflow-hidden select-none">
      {/* URL Selector & Method Bar */}
      <UrlBar
        method={method}
        onMethodChange={onMethodChange}
        url={url}
        onUrlChange={onUrlChange}
        onSend={onSend}
        onSave={onSave}
        loading={loading}
      />

      {/* Tabs Menu */}
      <div className="flex gap-4 border-b border-zinc-800 pb-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('params')}
          className={`pb-2 transition-all relative cursor-pointer select-none ${
            activeTab === 'params'
              ? 'text-orange-400 border-b-2 border-orange-500'
              : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          <span>Query Params</span>
          {paramsCount > 0 && (
            <span className="ml-1 px-1 py-0.2 bg-zinc-800 text-[10px] text-zinc-400 rounded-full">
              {paramsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('headers')}
          className={`pb-2 transition-all relative cursor-pointer select-none ${
            activeTab === 'headers'
              ? 'text-orange-400 border-b-2 border-orange-500'
              : 'text-zinc-500 hover:text-zinc-355'
          }`}
        >
          <span>Headers</span>
          {headersCount > 0 && (
            <span className="ml-1 px-1 py-0.2 bg-zinc-800 text-[10px] text-zinc-400 rounded-full">
              {headersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('body')}
          className={`pb-2 transition-all relative cursor-pointer select-none ${
            activeTab === 'body'
              ? 'text-orange-400 border-b-2 border-orange-500'
              : 'text-zinc-500 hover:text-zinc-355'
          }`}
        >
          <span>Body</span>
          {isBodyActive && (
            <span className="ml-1 w-1.5 h-1.5 bg-orange-450 rounded-full inline-block align-middle" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('auth')}
          className={`pb-2 transition-all relative cursor-pointer select-none ${
            activeTab === 'auth'
              ? 'text-orange-400 border-b-2 border-orange-500'
              : 'text-zinc-500 hover:text-zinc-355'
          }`}
        >
          <span>Authorization</span>
          {isAuthActive && (
            <span className="ml-1 w-1.5 h-1.5 bg-orange-450 rounded-full inline-block align-middle" />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'params' && (
          <div className="bg-zinc-950/20 p-2 rounded-lg border border-zinc-800">
            <KeyValueEditor items={params} onChange={onParamsChange} placeholderKey="Query Parameter Name" placeholderValue="Value" />
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="bg-zinc-950/20 p-2 rounded-lg border border-zinc-800">
            <KeyValueEditor items={headers} onChange={onHeadersChange} placeholderKey="Header Name" placeholderValue="Value" />
          </div>
        )}

        {activeTab === 'body' && (
          <BodyEditor
            bodyType={bodyType}
            onBodyTypeChange={onBodyTypeChange}
            body={body}
            onBodyChange={onBodyChange}
          />
        )}

        {activeTab === 'auth' && (
          <AuthEditor
            authType={authType}
            onAuthTypeChange={onAuthTypeChange}
            authData={authData}
            onAuthDataChange={onAuthDataChange}
          />
        )}
      </div>
    </div>
  );
}
