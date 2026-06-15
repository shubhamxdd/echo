import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { RequestPanel } from './components/RequestPanel/RequestPanel';
import { ResponsePanel } from './components/ResponsePanel/ResponsePanel';
import { Modal } from './components/common/Modal';
import { initDb } from './lib/db';
import { useCollections } from './hooks/useCollections';
import { useHistory } from './hooks/useHistory';
import { useRequest } from './hooks/useRequest';
import { Collection, SavedRequest, HistoryItem, HttpResponse, KeyValueItem } from './types';

function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  // Hook states
  const {
    collections,
    loadCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    saveRequest,
    deleteRequest,
    getCollectionExportData,
    importCollection,
  } = useCollections();

  const {
    historyList,
    loadHistory,
    addHistoryItem,
    clearHistory,
    deleteHistoryItem,
  } = useHistory();

  const { sendRequest, loading: requestLoading } = useRequest();

  // 1. Multi-Tab State
  interface RequestTab {
    id: string;
    savedRequestId: string | null;
    collectionId: string | null;
    name: string;
    method: string;
    url: string;
    headers: KeyValueItem[];
    params: KeyValueItem[];
    bodyType: 'none' | 'raw' | 'json' | 'form';
    body: string;
    authType: 'none' | 'bearer' | 'basic' | 'apikey';
    authData: any;
    activeResponse: HttpResponse | null;
  }

  const [tabs, setTabs] = useState<RequestTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');

  // Local active workspace request configuration state
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<KeyValueItem[]>([{ key: '', value: '', enabled: true }]);
  const [params, setParams] = useState<KeyValueItem[]>([{ key: '', value: '', enabled: true }]);
  const [bodyType, setBodyType] = useState<'none' | 'raw' | 'json' | 'form'>('none');
  const [body, setBody] = useState('');
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'basic' | 'apikey'>('none');
  const [authData, setAuthData] = useState<any>({});
  const [activeResponse, setActiveResponse] = useState<HttpResponse | null>(null);
  
  // Track if this is a saved request from the DB
  const [activeRequestMeta, setActiveRequestMeta] = useState<{
    id: string | null;
    collectionId: string | null;
    name: string | null;
  }>({
    id: null,
    collectionId: null,
    name: null,
  });

  // Modals state
  const [colModalOpen, setColModalOpen] = useState(false);
  const [colModalMode, setColModalMode] = useState<'create' | 'rename'>('create');
  const [colModalParentId, setColModalParentId] = useState<string | null>(null);
  const [colModalTargetId, setColModalTargetId] = useState<string | null>(null);
  const [colModalName, setColModalName] = useState('');
  const [colModalDesc, setColModalDesc] = useState('');

  const [saveReqModalOpen, setSaveReqModalOpen] = useState(false);
  const [saveReqName, setSaveReqName] = useState('');
  const [saveReqCollectionId, setSaveReqCollectionId] = useState('');

  const [shortcutModalOpen, setShortcutModalOpen] = useState(false);

  // 2. Initialize SQLite Database
  useEffect(() => {
    async function setup() {
      try {
        await initDb();
        setDbInitialized(true);
      } catch (err) {
        console.error('Failed to bootstrap database:', err);
      }
    }
    setup();
  }, []);

  // 3. Load DB data once initialized
  useEffect(() => {
    if (dbInitialized) {
      loadCollections();
      loadHistory();
    }
  }, [dbInitialized, loadCollections, loadHistory]);

  // 4. Initialize first default tab if empty
  useEffect(() => {
    if (dbInitialized && tabs.length === 0) {
      const defaultId = crypto.randomUUID();
      const defaultTab: RequestTab = {
        id: defaultId,
        savedRequestId: null,
        collectionId: null,
        name: 'New Request',
        method: 'GET',
        url: '',
        headers: [{ key: '', value: '', enabled: true }],
        params: [{ key: '', value: '', enabled: true }],
        bodyType: 'none',
        body: '',
        authType: 'none',
        authData: {},
        activeResponse: null,
      };
      setTabs([defaultTab]);
      setActiveTabId(defaultId);
    }
  }, [dbInitialized, tabs]);

  // 5. Synchronize local active workspace changes into the tabs list
  useEffect(() => {
    if (!activeTabId) return;
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              method,
              url,
              headers,
              params,
              bodyType,
              body,
              authType,
              authData,
              activeResponse,
              savedRequestId: activeRequestMeta.id,
              collectionId: activeRequestMeta.collectionId,
              name: activeRequestMeta.name || (url ? url.replace(/^https?:\/\//i, '').substring(0, 30) : 'New Request'),
            }
          : t
      )
    );
  }, [activeTabId, method, url, headers, params, bodyType, body, authType, authData, activeResponse, activeRequestMeta]);

  // 6. Switch Tab handler
  const switchTab = (nextTabId: string) => {
    if (!activeTabId || nextTabId === activeTabId) return;

    // Load next tab
    const nextTab = tabs.find((t) => t.id === nextTabId);
    if (nextTab) {
      setMethod(nextTab.method);
      setUrl(nextTab.url);
      setHeaders(nextTab.headers.length > 0 ? nextTab.headers : [{ key: '', value: '', enabled: true }]);
      setParams(nextTab.params.length > 0 ? nextTab.params : [{ key: '', value: '', enabled: true }]);
      setBodyType(nextTab.bodyType);
      setBody(nextTab.body);
      setAuthType(nextTab.authType);
      setAuthData(nextTab.authData || {});
      setActiveRequestMeta({
        id: nextTab.savedRequestId,
        collectionId: nextTab.collectionId,
        name: nextTab.name,
      });
      setActiveResponse(nextTab.activeResponse);
      setActiveTabId(nextTabId);
    }
  };

  // 7. Close Tab handler
  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (tabs.length === 1) {
      // Just reset the single tab
      const newId = crypto.randomUUID();
      setTabs([
        {
          id: newId,
          savedRequestId: null,
          collectionId: null,
          name: 'New Request',
          method: 'GET',
          url: '',
          headers: [{ key: '', value: '', enabled: true }],
          params: [{ key: '', value: '', enabled: true }],
          bodyType: 'none',
          body: '',
          authType: 'none',
          authData: {},
          activeResponse: null,
        },
      ]);
      setMethod('GET');
      setUrl('');
      setHeaders([{ key: '', value: '', enabled: true }]);
      setParams([{ key: '', value: '', enabled: true }]);
      setBodyType('none');
      setBody('');
      setAuthType('none');
      setAuthData({});
      setActiveRequestMeta({ id: null, collectionId: null, name: null });
      setActiveResponse(null);
      setActiveTabId(newId);
      return;
    }

    const index = tabs.findIndex((t) => t.id === tabId);
    const filteredTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(filteredTabs);

    if (activeTabId === tabId) {
      const nextActiveIndex = index === 0 ? 0 : index - 1;
      const nextTab = filteredTabs[nextActiveIndex];
      
      setMethod(nextTab.method);
      setUrl(nextTab.url);
      setHeaders(nextTab.headers.length > 0 ? nextTab.headers : [{ key: '', value: '', enabled: true }]);
      setParams(nextTab.params.length > 0 ? nextTab.params : [{ key: '', value: '', enabled: true }]);
      setBodyType(nextTab.bodyType);
      setBody(nextTab.body);
      setAuthType(nextTab.authType);
      setAuthData(nextTab.authData || {});
      setActiveRequestMeta({
        id: nextTab.savedRequestId,
        collectionId: nextTab.collectionId,
        name: nextTab.name,
      });
      setActiveResponse(nextTab.activeResponse);
      setActiveTabId(nextTab.id);
    }
  };

  // 8. Open New Empty Request Tab
  const handleNewRequest = useCallback(() => {
    const newTabId = crypto.randomUUID();
    const newTab: RequestTab = {
      id: newTabId,
      savedRequestId: null,
      collectionId: null,
      name: 'New Request',
      method: 'GET',
      url: '',
      headers: [{ key: '', value: '', enabled: true }],
      params: [{ key: '', value: '', enabled: true }],
      bodyType: 'none',
      body: '',
      authType: 'none',
      authData: {},
      activeResponse: null,
    };

    setTabs((prev) => [...prev, newTab]);
    
    setMethod('GET');
    setUrl('');
    setHeaders([{ key: '', value: '', enabled: true }]);
    setParams([{ key: '', value: '', enabled: true }]);
    setBodyType('none');
    setBody('');
    setAuthType('none');
    setAuthData({});
    setActiveRequestMeta({ id: null, collectionId: null, name: null });
    setActiveResponse(null);
    setActiveTabId(newTabId);
  }, []);

  // 9. Load selected request from Collection Tree (spawns/focuses tab)
  const handleRequestSelect = (req: SavedRequest) => {
    const existingTab = tabs.find((t) => t.savedRequestId === req.id);
    if (existingTab) {
      switchTab(existingTab.id);
      return;
    }

    const newTabId = crypto.randomUUID();
    const newTab: RequestTab = {
      id: newTabId,
      savedRequestId: req.id,
      collectionId: req.collection_id,
      name: req.name,
      method: req.method,
      url: req.url,
      headers: req.headers.length > 0 ? req.headers : [{ key: '', value: '', enabled: true }],
      params: req.params.length > 0 ? req.params : [{ key: '', value: '', enabled: true }],
      bodyType: req.body_type,
      body: req.body,
      authType: req.auth_type,
      authData: req.auth_data || {},
      activeResponse: null,
    };

    setTabs((prev) => [...prev, newTab]);

    setMethod(req.method);
    setUrl(req.url);
    setHeaders(req.headers.length > 0 ? req.headers : [{ key: '', value: '', enabled: true }]);
    setParams(req.params.length > 0 ? req.params : [{ key: '', value: '', enabled: true }]);
    setBodyType(req.body_type);
    setBody(req.body);
    setAuthType(req.auth_type);
    setAuthData(req.auth_data || {});
    setActiveRequestMeta({
      id: req.id,
      collectionId: req.collection_id,
      name: req.name,
    });
    setActiveResponse(null);
    setActiveTabId(newTabId);
  };

  // 10. Load request from history (loads into active tab)
  const handleHistorySelect = (item: HistoryItem) => {
    setMethod(item.method);
    setUrl(item.url);
    setHeaders(item.request_headers.length > 0 ? item.request_headers : [{ key: '', value: '', enabled: true }]);
    
    try {
      const urlObj = new URL(item.url.startsWith('http') ? item.url : 'http://' + item.url);
      const urlParams: KeyValueItem[] = [];
      urlObj.searchParams.forEach((value, key) => {
        urlParams.push({ key, value, enabled: true });
      });
      setParams(urlParams.length > 0 ? urlParams : [{ key: '', value: '', enabled: true }]);
    } catch (e) {
      setParams([{ key: '', value: '', enabled: true }]);
    }
    
    if (item.request_body) {
      if (item.request_body.startsWith('[') || item.request_body.startsWith('{')) {
        setBodyType('json');
      } else {
        setBodyType('raw');
      }
      setBody(item.request_body);
    } else {
      setBodyType('none');
      setBody('');
    }
    setAuthType('none');
    setAuthData({});
    setActiveRequestMeta({ id: null, collectionId: null, name: null });
    setActiveResponse(null);
  };

  // 11. Send Request handler
  const handleSend = async () => {
    if (!url.trim()) return;

    const response = await sendRequest(
      method,
      url,
      headers,
      params,
      bodyType,
      body,
      authType,
      authData
    );

    setActiveResponse(response);

    // Save in SQLite History
    if (dbInitialized) {
      const cleanedHeaders = headers.filter((h) => h.key.trim() !== '');
      await addHistoryItem({
        method,
        url,
        status_code: response.status,
        duration_ms: response.duration_ms,
        request_headers: cleanedHeaders,
        request_body: bodyType !== 'none' ? body : null,
        response_headers: response.headers,
        response_body: response.body,
        error: response.error,
      });
    }
  };

  // 12. Save request launcher
  const handleSaveLaunch = () => {
    if (activeRequestMeta.id) {
      saveRequest({
        id: activeRequestMeta.id,
        collection_id: activeRequestMeta.collectionId || '',
        name: activeRequestMeta.name || 'Request',
        method,
        url,
        headers: headers.filter((h) => h.key.trim() !== ''),
        params: params.filter((p) => p.key.trim() !== ''),
        body_type: bodyType,
        body,
        auth_type: authType,
        auth_data: authData,
      });
    } else {
      setSaveReqName(url ? url.replace(/^https?:\/\//i, '').substring(0, 30) : 'New Request');
      const flat = flattenCollections(collections);
      if (flat.length > 0) {
        setSaveReqCollectionId(flat[0].id);
      } else {
        setSaveReqCollectionId('');
      }
      setSaveReqModalOpen(true);
    }
  };

  // 13. Save request modal confirm
  const handleConfirmSave = async () => {
    if (!saveReqName.trim() || !saveReqCollectionId) return;

    const newId = crypto.randomUUID();
    const cleanedHeaders = headers.filter((h) => h.key.trim() !== '');
    const cleanedParams = params.filter((p) => p.key.trim() !== '');

    await saveRequest({
      id: newId,
      collection_id: saveReqCollectionId,
      name: saveReqName.trim(),
      method,
      url,
      headers: cleanedHeaders,
      params: cleanedParams,
      body_type: bodyType,
      body,
      auth_type: authType,
      auth_data: authData,
    });

    setActiveRequestMeta({
      id: newId,
      collectionId: saveReqCollectionId,
      name: saveReqName.trim(),
    });

    setSaveReqModalOpen(false);
  };

  // 14. Keyboard Shortcuts listener (Ctrl+Enter, Ctrl+S, Ctrl+N, ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveLaunch();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewRequest();
      }
      if (e.key === '?' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        setIsShortcutModalOpen(true);
      }
    };
    
    const setIsShortcutModalOpen = (open: boolean) => {
      setShortcutModalOpen(open);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [url, method, headers, params, bodyType, body, authType, authData, activeRequestMeta, collections, handleNewRequest]);

  // Flatten helper
  const flattenCollections = (cols: Collection[], depth = 0): { id: string; name: string }[] => {
    let result: { id: string; name: string }[] = [];
    cols.forEach((col) => {
      result.push({
        id: col.id,
        name: '— '.repeat(depth) + col.name,
      });
      if (col.children && col.children.length > 0) {
        result = [...result, ...flattenCollections(col.children, depth + 1)];
      }
    });
    return result;
  };

  // Folder modal handlers
  const openCreateColModal = (parentId: string | null = null) => {
    setColModalMode('create');
    setColModalParentId(parentId);
    setColModalName('');
    setColModalDesc('');
    setColModalOpen(true);
  };

  const openRenameColModal = (id: string, name: string) => {
    setColModalMode('rename');
    setColModalTargetId(id);
    setColModalName(name);
    setColModalDesc('');
    setColModalOpen(true);
  };

  const handleColSubmit = async () => {
    if (!colModalName.trim()) return;

    if (colModalMode === 'create') {
      await createCollection(colModalName.trim(), colModalDesc.trim() || null, colModalParentId);
    } else {
      await updateCollection(colModalTargetId!, colModalName.trim(), colModalDesc.trim() || null);
    }

    setColModalOpen(false);
  };

  // Import / Export handlers
  const handleExportFolder = async (colId: string) => {
    try {
      const exportData = await getCollectionExportData(colId);
      if (!exportData) return;

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${exportData.name || 'collection'}-export.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Failed to export collection:', e);
    }
  };

  const handleImportCollection = async (parsedData: any) => {
    try {
      await importCollection(parsedData, null);
    } catch (e) {
      console.error('Failed to import collection:', e);
      alert('Import failed. Please check the JSON format.');
    }
  };

  const handleSidebarCreateRequest = async (colId: string) => {
    const newId = crypto.randomUUID();
    await saveRequest({
      id: newId,
      collection_id: colId,
      name: 'New Request',
      method: 'GET',
      url: '',
      headers: [],
      params: [],
      body_type: 'none',
      body: '',
      auth_type: 'none',
      auth_data: {},
    });

    handleRequestSelect({
      id: newId,
      collection_id: colId,
      name: 'New Request',
      method: 'GET',
      url: '',
      headers: [],
      params: [],
      body_type: 'none',
      body: '',
      auth_type: 'none',
      auth_data: {},
      created_at: Date.now(),
      updated_at: Date.now(),
    });
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-150 overflow-hidden font-sans select-none">
      {/* 1. Left Sidebar */}
      <Sidebar
        collections={collections}
        historyItems={historyList}
        activeRequestId={activeRequestMeta.id}
        onRequestSelect={handleRequestSelect}
        onHistorySelect={handleHistorySelect}
        onDeleteHistoryItem={deleteHistoryItem}
        onClearHistory={clearHistory}
        onCreateCollectionClick={() => openCreateColModal(null)}
        onCreateSubfolder={(parentId) => openCreateColModal(parentId)}
        onCreateRequest={handleSidebarCreateRequest}
        onRenameFolder={openRenameColModal}
        onDeleteFolder={deleteCollection}
        onDeleteRequest={(id) => {
          deleteRequest(id);
          const tab = tabs.find((t) => t.savedRequestId === id);
          if (tab) {
            // Force close tab
            const syntheticEvent = { stopPropagation: () => {} } as any;
            closeTab(tab.id, syntheticEvent);
          }
        }}
        onExportFolder={handleExportFolder}
        onImportCollection={handleImportCollection}
        onHelpClick={() => setShortcutModalOpen(true)}
      />

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-zinc-900/40 border-b border-zinc-800/80 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium select-none">Active Work:</span>
            {activeRequestMeta.id ? (
              <span className="text-xs font-semibold text-violet-300 font-mono">
                {activeRequestMeta.name}
              </span>
            ) : (
              <span className="text-xs text-zinc-400 font-medium italic font-mono">
                Unsaved Request
              </span>
            )}
          </div>
          
          <button
            onClick={handleNewRequest}
            className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 py-1 px-2.5 rounded-md font-medium transition-all select-none"
            title="Create clean request workspace (Ctrl+N)"
          >
            + New Tab
          </button>
        </div>

        {/* Workspace Tab Bar */}
        <div className="flex bg-zinc-950 border-b border-zinc-800/80 items-center overflow-x-auto select-none no-scrollbar h-9 shrink-0">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`group flex items-center gap-2 px-3 py-2 border-r border-zinc-800/60 cursor-pointer text-xs transition-colors shrink-0 h-full ${
                  isActive
                    ? 'bg-zinc-900/30 text-violet-300 font-semibold border-b border-b-violet-500'
                    : 'text-zinc-500 hover:text-zinc-350 hover:bg-zinc-900/10'
                }`}
              >
                <span className={`text-[9px] font-mono font-bold shrink-0 ${
                  tab.method === 'GET' ? 'text-emerald-400' :
                  tab.method === 'POST' ? 'text-amber-400' :
                  tab.method === 'PUT' ? 'text-sky-400' :
                  tab.method === 'DELETE' ? 'text-rose-400' : 'text-fuchsia-400'
                }`}>
                  {tab.method}
                </span>
                <span className="max-w-[100px] truncate text-[11px] font-mono">
                  {tab.name}
                </span>
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className="text-zinc-650 hover:text-zinc-300 p-0.5 rounded transition-colors opacity-60 group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        {/* Request Panel (Top Half) */}
        <div className="flex-1 min-h-[300px]">
          <RequestPanel
            method={method}
            onMethodChange={setMethod}
            url={url}
            onUrlChange={setUrl}
            headers={headers}
            onHeadersChange={setHeaders}
            params={params}
            onParamsChange={setParams}
            bodyType={bodyType}
            onBodyTypeChange={setBodyType}
            body={body}
            onBodyChange={setBody}
            authType={authType}
            onAuthTypeChange={setAuthType}
            authData={authData}
            onAuthDataChange={setAuthData}
            onSend={handleSend}
            onSave={handleSaveLaunch}
            loading={requestLoading}
          />
        </div>

        {/* Response Panel (Bottom Half) */}
        <div className="h-[360px] flex-shrink-0">
          <ResponsePanel response={activeResponse} loading={requestLoading} />
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* Create / Rename Collection Folder Modal */}
      <Modal
        isOpen={colModalOpen}
        onClose={() => setColModalOpen(false)}
        title={colModalMode === 'create' ? 'Create Collection' : 'Rename Collection'}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-zinc-400">Name</label>
            <input
              type="text"
              placeholder="e.g. Auth Service APIs"
              value={colModalName}
              onChange={(e) => setColModalName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleColSubmit();
              }}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-violet-500/70 focus:outline-none rounded py-2 px-3 text-xs text-zinc-200"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-zinc-400">Description (Optional)</label>
            <input
              type="text"
              placeholder="APIs related to authentication..."
              value={colModalDesc}
              onChange={(e) => setColModalDesc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleColSubmit();
              }}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-violet-500/70 focus:outline-none rounded py-2 px-3 text-xs text-zinc-200"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3 mt-4">
            <button
              onClick={() => setColModalOpen(false)}
              className="px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:bg-zinc-850 hover:text-zinc-250 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleColSubmit}
              disabled={!colModalName.trim()}
              className="px-3.5 py-1.5 rounded-md text-xs bg-violet-600 hover:bg-violet-500 font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {colModalMode === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Save Request Modal */}
      <Modal
        isOpen={saveReqModalOpen}
        onClose={() => setSaveReqModalOpen(false)}
        title="Save Request"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-zinc-400">Request Name</label>
            <input
              type="text"
              placeholder="e.g. Login user"
              value={saveReqName}
              onChange={(e) => setSaveReqName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmSave();
              }}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-violet-500/70 focus:outline-none rounded py-2 px-3 text-xs text-zinc-200"
              autoFocus
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-zinc-400">Save In Collection</label>
            {collections.length === 0 ? (
              <div className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/10 p-2 rounded-md">
                No collections available. Please create a collection folder in the sidebar first!
              </div>
            ) : (
              <select
                value={saveReqCollectionId}
                onChange={(e) => setSaveReqCollectionId(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 focus:border-violet-500/70 focus:outline-none rounded py-2 px-3 text-zinc-200 text-xs w-full cursor-pointer"
              >
                {flattenCollections(collections).map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3 mt-4">
            <button
              onClick={() => setSaveReqModalOpen(false)}
              className="px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:bg-zinc-850 hover:text-zinc-250 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSave}
              disabled={!saveReqName.trim() || !saveReqCollectionId}
              className="px-3.5 py-1.5 rounded-md text-xs bg-violet-600 hover:bg-violet-500 font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Request
            </button>
          </div>
        </div>
      </Modal>

      {/* Keyboard Shortcuts Cheat-sheet Modal */}
      <Modal
        isOpen={shortcutModalOpen}
        onClose={() => setShortcutModalOpen(false)}
        title="Keyboard Shortcuts"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-b border-zinc-800 pb-4 text-xs font-mono">
            <div className="text-zinc-400">Ctrl + Enter</div>
            <div className="text-zinc-150">Send HTTP Request</div>

            <div className="text-zinc-400">Ctrl + S</div>
            <div className="text-zinc-150">Save Current Request Settings</div>

            <div className="text-zinc-400">Ctrl + N</div>
            <div className="text-zinc-150">Open New Request Tab</div>

            <div className="text-zinc-400">?</div>
            <div className="text-zinc-150">Toggle Keyboard Shortcuts Menu</div>
          </div>
          
          <div className="text-[10px] text-zinc-500 italic text-center">
            Tip: Pressing '?' anywhere outside input fields toggles this cheatsheet.
          </div>
          
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShortcutModalOpen(false)}
              className="px-3.5 py-1.5 rounded-md text-xs bg-zinc-800 hover:bg-zinc-750 text-zinc-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;
