export interface KeyValueItem {
  key: string;
  value: string;
  enabled: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  created_at: number;
  updated_at: number;
  // UI helpers
  children?: Collection[];
  requests?: SavedRequest[];
}

export interface AssertionItem {
  id: string;
  type: 'status_code' | 'duration' | 'body_json' | 'header_exists';
  targetValue: string;
  expectedValue: string;
  enabled: boolean;
}

export interface SavedRequest {
  id: string;
  collection_id: string;
  name: string;
  method: string; // 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string;
  headers: KeyValueItem[];
  params: KeyValueItem[];
  body_type: 'none' | 'raw' | 'json' | 'form';
  body: string;
  auth_type: 'none' | 'bearer' | 'basic' | 'apikey';
  auth_data: {
    bearer_token?: string;
    basic_username?: string;
    basic_password?: string;
    apikey_key?: string;
    apikey_value?: string;
    apikey_addTo?: 'header' | 'query';
  };
  assertions?: AssertionItem[];
  response?: HttpResponse | null;
  created_at: number;
  updated_at: number;
}

export interface HistoryItem {
  id: string;
  method: string;
  url: string;
  status_code: number | null;
  duration_ms: number | null;
  request_headers: KeyValueItem[];
  request_body: string | null;
  response_headers: KeyValueItem[];
  response_body: string | null;
  error: string | null;
  fired_at: number;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  duration_ms: number;
  headers: KeyValueItem[];
  body: string;
  error: string | null;
  isSaved?: boolean;
}

export interface Environment {
  id: string;
  name: string;
  variables: KeyValueItem[];
  created_at: number;
  updated_at: number;
}
