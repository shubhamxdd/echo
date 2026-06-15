import { Key } from 'lucide-react';

interface AuthEditorProps {
  authType: 'none' | 'bearer' | 'basic' | 'apikey';
  onAuthTypeChange: (type: 'none' | 'bearer' | 'basic' | 'apikey') => void;
  authData: any;
  onAuthDataChange: (data: any) => void;
}

export function AuthEditor({
  authType,
  onAuthTypeChange,
  authData,
  onAuthDataChange,
}: AuthEditorProps) {
  const handleFieldChange = (field: string, val: string) => {
    onAuthDataChange({
      ...authData,
      [field]: val,
    });
  };

  const authOptions = [
    { type: 'none', label: 'No Auth' },
    { type: 'bearer', label: 'Bearer Token' },
    { type: 'basic', label: 'Basic Auth' },
    { type: 'apikey', label: 'API Key' },
  ];

  return (
    <div className="flex flex-col gap-4 text-zinc-300 text-xs py-2">
      {/* Selector Buttons */}
      <div className="flex gap-2 border-b border-zinc-800 pb-3">
        {authOptions.map((opt) => (
          <button
            key={opt.type}
            onClick={() => onAuthTypeChange(opt.type as any)}
            className={`px-3 py-1.5 rounded-md border text-xs transition-colors select-none ${
              authType === opt.type
                ? 'bg-orange-500/10 border-orange-500 text-orange-350 font-medium'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Editor Details depending on Type */}
      <div className="bg-zinc-900/20 p-3 rounded-lg border border-zinc-800/50 min-h-[140px] flex flex-col justify-center">
        {authType === 'none' && (
          <div className="text-zinc-550 text-center flex flex-col items-center gap-1">
            <Key className="w-5 h-5 opacity-40 mb-1" />
            <span>This request does not use authorization helpers.</span>
            <span className="text-[10px]">Headers are sent as-is.</span>
          </div>
        )}

        {authType === 'bearer' && (
          <div className="space-y-2 max-w-lg">
            <label className="block text-zinc-400 font-medium mb-1">Token</label>
            <input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={authData?.bearer_token || ''}
              onChange={(e) => handleFieldChange('bearer_token', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded py-2 px-3 font-mono text-zinc-250"
            />
            <p className="text-[10px] text-zinc-550 mt-1">
              Bearer tokens are automatically added to the <strong>Authorization</strong> header.
            </p>
          </div>
        )}

        {authType === 'basic' && (
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            <div className="space-y-1">
              <label className="block text-zinc-400 font-medium">Username</label>
              <input
                type="text"
                placeholder="admin"
                value={authData?.basic_username || ''}
                onChange={(e) => handleFieldChange('basic_username', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded py-2 px-3 text-zinc-250"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-zinc-400 font-medium">Password</label>
              <input
                type="password"
                placeholder="password"
                value={authData?.basic_password || ''}
                onChange={(e) => handleFieldChange('basic_password', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded py-2 px-3 text-zinc-250"
              />
            </div>
            <p className="col-span-2 text-[10px] text-zinc-550 mt-1">
              Credentials are base64-encoded and appended as the <strong>Authorization: Basic ...</strong> header.
            </p>
          </div>
        )}

        {authType === 'apikey' && (
          <div className="space-y-4 max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-zinc-400 font-medium">Key Name</label>
                <input
                  type="text"
                  placeholder="X-API-Key"
                  value={authData?.apikey_key || ''}
                  onChange={(e) => handleFieldChange('apikey_key', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded py-2 px-3 font-mono text-zinc-250"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-zinc-400 font-medium">Value</label>
                <input
                  type="text"
                  placeholder="your-api-secret-key"
                  value={authData?.apikey_value || ''}
                  onChange={(e) => handleFieldChange('apikey_value', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded py-2 px-3 font-mono text-zinc-250"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-zinc-400 font-medium">Add To</label>
              <select
                value={authData?.apikey_addTo || 'header'}
                onChange={(e) => handleFieldChange('apikey_addTo', e.target.value)}
                className="bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded py-2 px-3 text-zinc-250 text-xs w-48 cursor-pointer"
              >
                <option value="header">Headers</option>
                <option value="query">Query Params</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
