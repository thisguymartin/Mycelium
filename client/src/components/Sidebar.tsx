import { Users, MessageSquare, Settings, X } from 'lucide-react';
import { useStore } from '../store';
import { Chat } from './Chat';

interface SidebarProps {
  onSendMessage: (content: string) => void;
}

export function Sidebar({ onSendMessage }: SidebarProps) {
  const isSidebarOpen = useStore((state) => state.isSidebarOpen);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const activeTab = useStore((state) => state.activeTab);
  const setActiveTab = useStore((state) => state.setActiveTab);
  const peers = useStore((state) => state.peers);
  const currentAgent = useStore((state) => state.currentAgent);
  const currentRoom = useStore((state) => state.currentRoom);
  const isConnected = useStore((state) => state.isConnected);

  if (!isSidebarOpen) {
    return null;
  }

  const tabs = [
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
    { id: 'agents' as const, label: 'Agents', icon: Users },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-gray-800 shadow-2xl z-10 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-white">SwarmTech</h2>
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Room info */}
        <div className="text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          {currentRoom && (
            <div className="text-gray-400 mt-1">
              Room: {currentRoom.name}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-gray-900 text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <tab.icon size={20} />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && <Chat onSendMessage={onSendMessage} />}
        {activeTab === 'agents' && <AgentsList />}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  );
}

function AgentsList() {
  const peers = useStore((state) => state.peers);
  const currentAgent = useStore((state) => state.currentAgent);
  const locations = useStore((state) => state.locations);

  const allAgents = currentAgent ? [currentAgent, ...Array.from(peers.values())] : Array.from(peers.values());

  return (
    <div className="p-4 space-y-3 overflow-y-auto h-full">
      <div className="text-sm text-gray-400 mb-4">
        {allAgents.length} agent{allAgents.length !== 1 ? 's' : ''} active
      </div>

      {allAgents.map((agent) => {
        const hasLocation = locations.has(agent.id);
        const isYou = agent.id === currentAgent?.id;

        return (
          <div
            key={agent.id}
            className="bg-gray-900 p-3 rounded-lg flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: agent.color }}
            >
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{agent.name}</span>
                {isYou && (
                  <span className="text-xs bg-primary px-2 py-0.5 rounded text-white">You</span>
                )}
              </div>
              <div className="text-sm text-gray-400 capitalize">{agent.role.replace('-', ' ')}</div>
              {hasLocation && (
                <div className="text-xs text-green-400 mt-1">📍 Location active</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SettingsPanel() {
  const currentAgent = useStore((state) => state.currentAgent);

  return (
    <div className="p-4 space-y-4 text-white">
      <div>
        <h3 className="text-lg font-semibold mb-2">Your Profile</h3>
        {currentAgent && (
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">Name:</span> {currentAgent.name}
            </div>
            <div>
              <span className="text-gray-400">Role:</span>{' '}
              <span className="capitalize">{currentAgent.role.replace('-', ' ')}</span>
            </div>
            <div>
              <span className="text-gray-400">ID:</span>{' '}
              <code className="text-xs bg-gray-900 px-2 py-1 rounded">{currentAgent.id}</code>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-700">
        <h3 className="text-lg font-semibold mb-2">About</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          SwarmTech is a decentralized peer-to-peer coordination platform for disaster response
          teams. It uses WebRTC for direct communication and CRDTs for conflict-free data
          synchronization.
        </p>
      </div>

      <div className="pt-4 border-t border-gray-700">
        <h3 className="text-lg font-semibold mb-2">Technology</h3>
        <div className="text-sm text-gray-400 space-y-1">
          <div>✓ WebRTC P2P Communication</div>
          <div>✓ Yjs CRDT Synchronization</div>
          <div>✓ GeoJSON Location Data</div>
          <div>✓ End-to-End Encrypted</div>
        </div>
      </div>
    </div>
  );
}
