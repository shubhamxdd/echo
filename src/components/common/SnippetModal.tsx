import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { KeyValueItem } from '../../types';
import { Copy, Check } from 'lucide-react';

interface SnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  method: string;
  url: string;
  headers: KeyValueItem[];
  params: KeyValueItem[];
  bodyType: 'none' | 'raw' | 'json' | 'form';
  body: string;
  authType: 'none' | 'bearer' | 'basic' | 'apikey';
  authData: any;
  resolvedEnvVars?: Record<string, string>; // to resolve vars in snippets too!
}

export function SnippetModal({
  isOpen,
  onClose,
  method,
  url,
  headers,
  params,
  bodyType,
  body,
  authType,
  authData,
  resolvedEnvVars = {},
}: SnippetModalProps) {
  const [lang, setLang] = useState<'curl' | 'js' | 'python' | 'rust'>('curl');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Helper to resolve variables in a string
  const resolve = (txt: string) => {
    if (!txt) return txt;
    return txt.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmed = key.trim();
      return resolvedEnvVars[trimmed] !== undefined ? resolvedEnvVars[trimmed] : match;
    });
  };

  // 1. Build Full URL
  let finalUrl = resolve(url.trim()) || 'http://example.com';
  if (!/^https?:\/\//i.test(finalUrl)) {
    finalUrl = 'http://' + finalUrl;
  }
  
  // Append query params
  try {
    const urlObj = new URL(finalUrl);
    params.forEach((p) => {
      if (p.enabled && p.key) {
        urlObj.searchParams.append(resolve(p.key), resolve(p.value));
      }
    });
    if (authType === 'apikey' && authData?.apikey_addTo === 'query' && authData?.apikey_key) {
      urlObj.searchParams.append(resolve(authData.apikey_key), resolve(authData.apikey_value || ''));
    }
    finalUrl = urlObj.toString();
  } catch (e) {
    // Fallback manual append
    const searchParams = new URLSearchParams();
    params.forEach((p) => {
      if (p.enabled && p.key) {
        searchParams.append(resolve(p.key), resolve(p.value));
      }
    });
    if (authType === 'apikey' && authData?.apikey_addTo === 'query' && authData?.apikey_key) {
      searchParams.append(resolve(authData.apikey_key), resolve(authData.apikey_value || ''));
    }
    const qs = searchParams.toString();
    if (qs) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + qs;
    }
  }

  // 2. Build Headers
  const reqHeaders: Record<string, string> = {};
  headers.forEach((h) => {
    if (h.enabled && h.key) {
      reqHeaders[resolve(h.key)] = resolve(h.value);
    }
  });

  if (authType === 'bearer' && authData?.bearer_token) {
    reqHeaders['Authorization'] = `Bearer ${resolve(authData.bearer_token)}`;
  } else if (authType === 'basic' && (authData?.basic_username || authData?.basic_password)) {
    const username = resolve(authData.basic_username || '');
    const password = resolve(authData.basic_password || '');
    const encoded = btoa(`${username}:${password}`);
    reqHeaders['Authorization'] = `Basic ${encoded}`;
  } else if (authType === 'apikey' && authData?.apikey_addTo === 'header' && authData?.apikey_key) {
    reqHeaders[resolve(authData.apikey_key)] = resolve(authData.apikey_value || '');
  }

  let finalBody = '';
  if (method !== 'GET' && method !== 'HEAD') {
    if (bodyType === 'json') {
      finalBody = resolve(body);
      if (!reqHeaders['Content-Type']) {
        reqHeaders['Content-Type'] = 'application/json';
      }
    } else if (bodyType === 'raw') {
      finalBody = resolve(body);
    } else if (bodyType === 'form') {
      try {
        const formItems = JSON.parse(body) as KeyValueItem[];
        const urlParams = new URLSearchParams();
        formItems.forEach((item) => {
          if (item.enabled && item.key) {
            urlParams.append(resolve(item.key), resolve(item.value));
          }
        });
        finalBody = urlParams.toString();
        if (!reqHeaders['Content-Type']) {
          reqHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      } catch (e) {
        finalBody = resolve(body);
      }
    }
  }

  // 3. Generate Code
  let code = '';
  if (lang === 'curl') {
    code = `curl --request ${method} \\\n  --url '${finalUrl}'`;
    Object.entries(reqHeaders).forEach(([k, v]) => {
      code += ` \\\n  --header '${k}: ${v}'`;
    });
    if (finalBody) {
      // Escape single quotes for shell
      const escapedBody = finalBody.replace(/'/g, "'\\''");
      code += ` \\\n  --data '${escapedBody}'`;
    }
  } else if (lang === 'js') {
    const fetchOptions: any = { method };
    if (Object.keys(reqHeaders).length > 0) {
      fetchOptions.headers = reqHeaders;
    }
    if (finalBody) {
      fetchOptions.body = finalBody;
    }

    code = `fetch('${finalUrl}', ${JSON.stringify(fetchOptions, null, 2)})\n`;
    code += `  .then(response => response.text())\n`;
    code += `  .then(result => console.log(result))\n`;
    code += `  .catch(error => console.error('error', error));`;
  } else if (lang === 'python') {
    code = `import requests\n\n`;
    code += `url = "${finalUrl}"\n\n`;
    if (Object.keys(reqHeaders).length > 0) {
      code += `headers = ${JSON.stringify(reqHeaders, null, 4)}\n\n`;
    } else {
      code += `headers = {}\n\n`;
    }
    if (finalBody) {
      code += `payload = """${finalBody}"""\n`;
      code += `response = requests.request("${method}", url, headers=headers, data=payload)\n`;
    } else {
      code += `response = requests.request("${method}", url, headers=headers)\n`;
    }
    code += `\nprint(response.text)\n`;
  } else if (lang === 'rust') {
    code = `use std::collections::HashMap;\n\n`;
    code += `#[tokio::main]\n`;
    code += `async fn main() -> Result<(), Box<dyn std::error::Error>> {\n`;
    code += `    let client = reqwest::Client::new();\n`;
    if (Object.keys(reqHeaders).length > 0) {
      code += `    let mut headers = reqwest::header::HeaderMap::new();\n`;
      Object.entries(reqHeaders).forEach(([k, v]) => {
        code += `    headers.insert("${k}", "${v}".parse()?);\n`;
      });
    }
    code += `\n`;
    if (finalBody) {
      code += `    let body = r#"${finalBody}"#;\n`;
    }
    code += `    let response = client.request(reqwest::Method::${method}, "${finalUrl}")\n`;
    if (Object.keys(reqHeaders).length > 0) {
      code += `        .headers(headers)\n`;
    }
    if (finalBody) {
      code += `        .body(body)\n`;
    }
    code += `        .send()\n`;
    code += `        .await?;\n\n`;
    code += `    println!("{}", response.text().await?);\n`;
    code += `    Ok(())\n`;
    code += `}\n`;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Code Snippet">
      <div className="space-y-4 text-zinc-200 select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-semibold text-zinc-400">Target Language</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 focus:outline-none rounded py-1 px-2.5 text-zinc-200 text-xs cursor-pointer"
            >
              <option value="curl">cURL (Shell)</option>
              <option value="js">JavaScript (Fetch)</option>
              <option value="python">Python (Requests)</option>
              <option value="rust">Rust (Reqwest)</option>
            </select>
          </div>
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 rounded text-xs text-orange-400 hover:text-orange-300 font-semibold cursor-pointer transition-all active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        <div className="relative">
          <pre className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] leading-relaxed overflow-x-auto text-zinc-300 select-text max-h-[300px]">
            {code}
          </pre>
        </div>
      </div>
    </Modal>
  );
}
