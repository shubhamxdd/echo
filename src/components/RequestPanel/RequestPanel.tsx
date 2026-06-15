import { useState } from 'react';
import { KeyValueItem } from '../../types';
import { UrlBar } from './UrlBar';
import { AuthEditor } from './AuthEditor';
import { BodyEditor } from './BodyEditor';
import { KeyValueEditor } from '../common/KeyValueEditor';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  onCancel?: () => void;
  onGenerateCode?: () => void;
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
  onCancel,
  onGenerateCode,
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
        onCancel={onCancel}
        onGenerateCode={onGenerateCode}
      />

      {/* Tabs Menu */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'params' | 'headers' | 'body' | 'auth')}
        id="tour-reqtabs"
        className="w-full border-b border-zinc-800"
      >
        <TabsList variant="line" className="h-8 justify-start gap-4">
          <TabsTrigger
            value="params"
            className="pb-2 cursor-pointer font-medium text-xs rounded-none data-[state=active]:text-orange-400 after:bg-orange-500"
          >
            <span>Query Params</span>
            {paramsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-zinc-800 text-[10px] text-zinc-400 rounded-full font-mono">
                {paramsCount}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="headers"
            className="pb-2 cursor-pointer font-medium text-xs rounded-none data-[state=active]:text-orange-400 after:bg-orange-500"
          >
            <span>Headers</span>
            {headersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-zinc-800 text-[10px] text-zinc-400 rounded-full font-mono">
                {headersCount}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="body"
            className="pb-2 cursor-pointer font-medium text-xs rounded-none data-[state=active]:text-orange-400 after:bg-orange-500"
          >
            <span>Body</span>
            {isBodyActive && (
              <span className="ml-1 w-1.5 h-1.5 bg-orange-450 rounded-full inline-block align-middle" />
            )}
          </TabsTrigger>

          <TabsTrigger
            value="auth"
            className="pb-2 cursor-pointer font-medium text-xs rounded-none data-[state=active]:text-orange-400 after:bg-orange-500"
          >
            <span>Authorization</span>
            {isAuthActive && (
              <span className="ml-1 w-1.5 h-1.5 bg-orange-450 rounded-full inline-block align-middle" />
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

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
