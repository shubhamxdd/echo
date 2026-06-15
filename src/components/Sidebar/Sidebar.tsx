import { useState } from 'react';
import { Collection, SavedRequest, HistoryItem } from '../../types';
import { CollectionTree } from './CollectionTree';
import { HistoryList } from './HistoryList';
import { FolderPlus, Search, History, FolderOpen, Upload, HelpCircle, Compass } from 'lucide-react';
import { useAlertDialog } from '../common/AlertDialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface SidebarProps {
  collections: Collection[];
  historyItems: HistoryItem[];
  activeRequestId: string | null;
  onRequestSelect: (req: SavedRequest) => void;
  onHistorySelect: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  onCreateCollectionClick: () => void;
  onCreateSubfolder: (parentId: string) => void;
  onCreateRequest: (collectionId: string) => void;
  onRenameFolder: (id: string, currentName: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onExportFolder: (id: string) => void;
  onImportCollection: (data: any) => void;
  onHelpClick: () => void;
  onTourClick?: () => void;
  onMoveRequest?: (requestId: string, currentCollectionId: string) => void;
  onMoveRequestDirect?: (requestId: string, targetCollectionId: string) => void;
  onDuplicateFolder?: (id: string) => void;
  onDuplicateRequest?: (id: string) => void;
}

export function Sidebar({
  collections,
  historyItems,
  activeRequestId,
  onRequestSelect,
  onHistorySelect,
  onDeleteHistoryItem,
  onClearHistory,
  onCreateCollectionClick,
  onCreateSubfolder,
  onCreateRequest,
  onRenameFolder,
  onDeleteFolder,
  onDeleteRequest,
  onExportFolder,
  onImportCollection,
  onHelpClick,
  onTourClick,
  onMoveRequest,
  onMoveRequestDirect,
  onDuplicateFolder,
  onDuplicateRequest,
}: SidebarProps) {
  const { showAlert } = useAlertDialog();
  const [activeTab, setActiveTab] = useState<'collections' | 'history'>('collections');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering helper for Collections
  const filterCollections = (cols: Collection[], query: string): Collection[] => {
    if (!query) return cols;
    const lowerQuery = query.toLowerCase();

    return cols
      .map((col) => {
        // Filter sub-folders
        const filteredChildren = col.children ? filterCollections(col.children, query) : [];
        
        // Filter requests
        const filteredRequests = col.requests
          ? col.requests.filter(
              (r) =>
                r.name.toLowerCase().includes(lowerQuery) ||
                r.url.toLowerCase().includes(lowerQuery) ||
                r.method.toLowerCase().includes(lowerQuery)
            )
          : [];

        // Match collection itself
        const colMatches = col.name.toLowerCase().includes(lowerQuery);

        if (colMatches || filteredChildren.length > 0 || filteredRequests.length > 0) {
          const matchedCol: Collection = {
            ...col,
            children: filteredChildren,
            requests: filteredRequests,
          };
          return matchedCol;
        }
        return null;
      })
      .filter((c): c is Collection => c !== null);
  };

  const filteredCollections = filterCollections(collections, searchQuery);

  return (
    <div className="w-full bg-zinc-900 flex flex-col h-full overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-600 rounded-md flex items-center justify-center font-bold text-sm text-white">
            E
          </div>
          <span className="font-semibold text-xs tracking-wide text-zinc-100">Echo</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Tour Button */}
          {onTourClick && (
            <button
              onClick={onTourClick}
              className="text-zinc-400 hover:text-orange-400 p-1.5 rounded-md hover:bg-zinc-850 transition-colors cursor-pointer"
              title="Take a Quick Tour"
            >
              <Compass className="w-4 h-4" />
            </button>
          )}

          {/* Help Button */}
          <button
            onClick={onHelpClick}
            className="text-zinc-400 hover:text-orange-405 p-1.5 rounded-md hover:bg-zinc-850 transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Import Button */}
          <label
            className="text-zinc-400 hover:text-orange-405 p-1.5 rounded-md hover:bg-zinc-850 transition-colors cursor-pointer"
            title="Import collection"
          >
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const parsed = JSON.parse(event.target?.result as string);
                    onImportCollection(parsed);
                  } catch (err) {
                    showAlert('Failed to parse the imported JSON file. Please ensure it is a valid Echo Collection file.', 'Invalid JSON File');
                  }
                };
                reader.readAsText(file);
                e.target.value = ''; // Reset
              }}
              className="hidden"
            />
          </label>

          {/* Create Collection */}
          <button
            onClick={onCreateCollectionClick}
            className="text-zinc-400 hover:text-orange-400 p-1.5 rounded-md hover:bg-zinc-850 transition-colors"
            title="Create new collection"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'collections' | 'history')}
        className="px-3 pt-2 pb-1"
      >
        <TabsList className="grid w-full grid-cols-2 bg-zinc-950 border border-zinc-800/85 p-[2px] h-8 rounded-lg">
          <TabsTrigger
            value="collections"
            className="flex items-center justify-center gap-1.5 text-xs font-medium data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 hover:text-zinc-300 py-1 cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Collections
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex items-center justify-center gap-1.5 text-xs font-medium data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 hover:text-zinc-300 py-1 cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            History
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search Input (only for collections tab) */}
      {activeTab === 'collections' && (
        <div className="px-3 py-2">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-zinc-650 z-10 pointer-events-none" />
            <Input
              type="text"
              placeholder="Filter collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border-zinc-800 focus-visible:border-orange-500/70 focus-visible:ring-orange-500/25 pl-8 text-xs text-zinc-200 placeholder-zinc-700 h-8"
            />
          </div>
        </div>
      )}

      {/* Scrollable Tree/List Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4">
        {activeTab === 'collections' ? (
          <CollectionTree
            collections={filteredCollections}
            activeRequestId={activeRequestId}
            onRequestSelect={onRequestSelect}
            onCreateSubfolder={onCreateSubfolder}
            onCreateRequest={onCreateRequest}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
            onDeleteRequest={onDeleteRequest}
            onExportFolder={onExportFolder}
            onMoveRequest={onMoveRequest}
            onMoveRequestDirect={onMoveRequestDirect}
            onDuplicateFolder={onDuplicateFolder}
            onDuplicateRequest={onDuplicateRequest}
          />
        ) : (
          <HistoryList
            historyItems={historyItems}
            onItemSelect={onHistorySelect}
            onDeleteItem={onDeleteHistoryItem}
            onClearHistory={onClearHistory}
          />
        )}
      </div>
    </div>
  );
}
