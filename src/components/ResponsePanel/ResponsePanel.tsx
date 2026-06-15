import { useState } from 'react';
import { HttpResponse } from '../../types';
import { StatusBar } from './StatusBar';
import { JsonViewer } from './JsonViewer';
import { ResponseHeaders } from './ResponseHeaders';
import { AlertCircle, Terminal, HelpCircle } from 'lucide-react';

interface ResponsePanelProps {
  response: HttpResponse | null;
  loading: boolean;
}

export function ResponsePanel({ response, loading }: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');

  const headersCount = response?.headers ? response.headers.length : 0;

  return (
    <div className="flex flex-col h-full bg-zinc-900/10 p-4 gap-3 overflow-hidden select-none border-t border-zinc-800/80">
      {/* Response Panel Title & Status Line */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-orange-400" />
          <h2 className="text-xs font-semibold text-zinc-150 uppercase tracking-wider">Response</h2>
        </div>
        
        {response && !loading && (
          <StatusBar
            status={response.status}
            statusText={response.statusText}
            duration={response.duration_ms}
            size={response.body ? response.body.length : 0}
            loading={loading}
          />
        )}
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col justify-start">
        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-6 gap-3 text-zinc-550 text-xs my-auto">
            <span className="w-6 h-6 border-2 border-zinc-700 border-t-orange-500 rounded-full animate-spin" />
            <span>Executing request... Bypassing CORS natively...</span>
          </div>
        ) : !response ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-zinc-600 text-xs text-center my-auto">
            <HelpCircle className="w-6 h-6 opacity-30 mb-1" />
            <span className="font-medium">No Request Fired</span>
            <span className="text-[10px] text-zinc-650">Enter a URL above and click "Send" to execute a call.</span>
          </div>
        ) : response.error ? (
          // Error State
          <div className="bg-red-500/5 border border-red-500/15 p-4 rounded-lg flex gap-3 text-xs text-red-400 select-text my-auto max-h-full overflow-auto">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <div className="space-y-1.5 font-sans">
              <div className="font-semibold">Network Connection Failed</div>
              <div className="font-mono text-[10px] break-all leading-normal opacity-90">
                {response.error}
              </div>
            </div>
          </div>
        ) : (
          // Successful / Finished Response State
          <div className="flex flex-col h-full gap-3">
            {/* Inner Tabs Selector */}
            <div className="flex gap-4 border-b border-zinc-800 pb-1 text-xs font-medium">
              <button
                onClick={() => setActiveTab('body')}
                className={`pb-1.5 transition-all relative cursor-pointer select-none ${
                  activeTab === 'body'
                    ? 'text-orange-400 border-b-2 border-orange-500'
                    : 'text-zinc-500 hover:text-zinc-350'
                }`}
              >
                Body
              </button>

              <button
                onClick={() => setActiveTab('headers')}
                className={`pb-1.5 transition-all relative cursor-pointer select-none ${
                  activeTab === 'headers'
                    ? 'text-orange-400 border-b-2 border-orange-500'
                    : 'text-zinc-500 hover:text-zinc-350'
                }`}
              >
                Headers
                {headersCount > 0 && (
                  <span className="ml-1 px-1 py-0.2 bg-zinc-800 text-[10px] text-zinc-500 rounded-full font-mono">
                    {headersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Inner Content panels */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {activeTab === 'body' && <JsonViewer body={response.body} />}
              {activeTab === 'headers' && <ResponseHeaders headers={response.headers} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
