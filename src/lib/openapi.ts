import { SavedRequest } from '../types';

export interface OpenAPIImportResult {
  collectionName: string;
  requests: Omit<SavedRequest, 'id' | 'collection_id' | 'created_at' | 'updated_at'>[];
}

export function parseOpenAPI(spec: any): OpenAPIImportResult {
  const collectionName = spec.info?.title || 'OpenAPI Import';
  const requests: Omit<SavedRequest, 'id' | 'collection_id' | 'created_at' | 'updated_at'>[] = [];

  const paths = spec.paths || {};
  const servers = spec.servers || [];
  let baseUrl = servers[0]?.url || spec.host || 'http://localhost';
  
  // Replace server template variables (e.g. {server}) with defaults
  if (servers[0]?.variables) {
    Object.entries(servers[0].variables).forEach(([k, v]: [string, any]) => {
      baseUrl = baseUrl.replace(`{${k}}`, v.default || '');
    });
  }

  Object.entries(paths).forEach(([path, pathItem]: [string, any]) => {
    Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
      // Validate HTTP method
      const upperMethod = method.toUpperCase();
      if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(upperMethod)) return;

      const summary = operation.summary || operation.operationId || `${upperMethod} ${path}`;
      
      // Build Headers and Query params
      const headers: { key: string; value: string; enabled: boolean }[] = [];
      const params: { key: string; value: string; enabled: boolean }[] = [];
      
      const parameters = operation.parameters || [];
      parameters.forEach((param: any) => {
        if (param.in === 'header') {
          headers.push({ key: param.name, value: String(param.example || ''), enabled: param.required || false });
        } else if (param.in === 'query') {
          params.push({ key: param.name, value: String(param.example || ''), enabled: param.required || false });
        }
      });

      // Request Body
      let body = '';
      let bodyType: 'none' | 'raw' | 'json' | 'form' = 'none';

      const requestBody = operation.requestBody;
      if (requestBody && requestBody.content) {
        const jsonContent = requestBody.content['application/json'];
        const formContent = requestBody.content['application/x-www-form-urlencoded'];

        if (jsonContent) {
          bodyType = 'json';
          const schema = jsonContent.schema;
          if (schema && schema.properties) {
            const mockObj: Record<string, any> = {};
            Object.entries(schema.properties).forEach(([k, v]: [string, any]) => {
              mockObj[k] = v.example !== undefined ? v.example : v.type === 'string' ? '' : v.type === 'number' ? 0 : null;
            });
            body = JSON.stringify(mockObj, null, 2);
          } else {
            body = '{}';
          }
          headers.push({ key: 'Content-Type', value: 'application/json', enabled: true });
        } else if (formContent) {
          bodyType = 'form';
          const schema = formContent.schema;
          if (schema && schema.properties) {
            const formItems: { key: string; value: string; enabled: boolean }[] = [];
            Object.entries(schema.properties).forEach(([k, v]: [string, any]) => {
              formItems.push({ key: k, value: String(v.example || ''), enabled: true });
            });
            body = JSON.stringify(formItems);
          }
          headers.push({ key: 'Content-Type', value: 'application/x-www-form-urlencoded', enabled: true });
        }
      }

      requests.push({
        name: summary,
        method: upperMethod,
        url: baseUrl.startsWith('http') || baseUrl.startsWith('{{') ? `${baseUrl}${path}` : `http://${baseUrl}${path}`,
        headers,
        params,
        body_type: bodyType,
        body,
        auth_type: 'none',
        auth_data: {},
      });
    });
  });

  return {
    collectionName,
    requests,
  };
}
