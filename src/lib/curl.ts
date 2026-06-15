export interface ParsedCurl {
  method: string;
  url: string;
  headers: { key: string; value: string; enabled: boolean }[];
  body: string;
  bodyType: 'none' | 'raw' | 'json' | 'form';
}

export function parseCurl(curlCommand: string): ParsedCurl {
  const result: ParsedCurl = {
    method: 'GET',
    url: '',
    headers: [],
    body: '',
    bodyType: 'none',
  };

  // Clean up line breaks and escape sequences
  const cleanCmd = curlCommand
    .replace(/\\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Tokenize the command handling single and double quotes
  const tokens: string[] = [];
  let currentToken = '';
  let insideQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < cleanCmd.length; i++) {
    const char = cleanCmd[i];
    if ((char === "'" || char === '"') && (i === 0 || cleanCmd[i - 1] !== '\\')) {
      if (insideQuotes && char === quoteChar) {
        insideQuotes = false;
      } else if (!insideQuotes) {
        insideQuotes = true;
        quoteChar = char;
      }
    } else if (char === ' ' && !insideQuotes) {
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = '';
      }
    } else {
      currentToken += char;
    }
  }
  if (currentToken) {
    tokens.push(currentToken);
  }

  // Parse tokens
  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];
    
    // HTTP Method
    if (token === '-X' || token === '--request') {
      const next = tokens[i + 1];
      if (next) {
        result.method = next.toUpperCase();
        i++;
      }
    }
    // Headers
    else if (token === '-H' || token === '--header') {
      const next = tokens[i + 1];
      if (next) {
        const colonIndex = next.indexOf(':');
        if (colonIndex > -1) {
          const key = next.substring(0, colonIndex).trim();
          const value = next.substring(colonIndex + 1).trim();
          result.headers.push({ key, value, enabled: true });
        }
        i++;
      }
    }
    // Request Body
    else if (
      token === '-d' ||
      token === '--data' ||
      token === '--data-raw' ||
      token === '--data-binary' ||
      token === '--data-urlencode'
    ) {
      const next = tokens[i + 1];
      if (next) {
        result.body = next;
        result.bodyType = 'raw';
        try {
          JSON.parse(next);
          result.bodyType = 'json';
        } catch (_) {}
        if (result.method === 'GET') {
          result.method = 'POST'; // curl defaults to POST when body is present
        }
        i++;
      }
    }
    // URL
    else if (token === '--url') {
      const next = tokens[i + 1];
      if (next) {
        result.url = next;
        i++;
      }
    }
    // Positional URL (starts with http or contains standard domain, is not an option)
    else if (!token.startsWith('-') && !result.url) {
      result.url = token.replace(/^["']|["']$/g, '');
    }
  }

  // Final check: if no URL, find candidate token not starting with -
  if (!result.url) {
    const candidate = tokens.find(
      (t) => !t.startsWith('-') && (t.startsWith('http') || t.includes('.'))
    );
    if (candidate) {
      result.url = candidate.replace(/^["']|["']$/g, '');
    }
  }

  // If body exists but no Content-Type header, default to application/json
  if (result.body && !result.headers.some((h) => h.key.toLowerCase() === 'content-type')) {
    if (result.bodyType === 'json') {
      result.headers.push({ key: 'Content-Type', value: 'application/json', enabled: true });
    }
  }

  return result;
}
