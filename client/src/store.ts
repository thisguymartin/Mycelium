import { create } from 'zustand';
import { Agent, AgentLocation, ChatMessage, Room } from '@swarmtech/common';

interface AppState {
  // User info
  currentAgent: Agent | null;
  setCurrentAgent: (agent: Agent) => void;

  // Room info
  currentRoom: Room | null;
  setCurrentRoom: (room: Room | null) => void;

  // Peers
  peers: Map<string, Agent>;
  addPeer: (peer: Agent) => void;
  removePeer: (peerId: string) => void;
  setPeers: (peers: Agent[]) => void;

  // Locations
  locations: Map<string, AgentLocation>;
  updateLocation: (agentId: string, location: AgentLocation) => void;

  // Messages
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;

  // Connection status
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;

  // WebRTC connections
  peerConnections: Map<string, RTCPeerConnection>;
  addPeerConnection: (peerId: string, connection: RTCPeerConnection) => void;
  removePeerConnection: (peerId: string) => void;

  // UI state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  activeTab: 'chat' | 'agents' | 'settings';
  setActiveTab: (tab: 'chat' | 'agents' | 'settings') => void;
}

export const useStore = create<AppState>((set) => ({
  // User info
  currentAgent: null,
  setCurrentAgent: (agent) => set({ currentAgent: agent }),

  // Room info
  currentRoom: null,
  setCurrentRoom: (room) => set({ currentRoom: room }),

  // Peers
  peers: new Map(),
  addPeer: (peer) =>
    set((state) => {
      const newPeers = new Map(state.peers);
      newPeers.set(peer.id, peer);
      return { peers: newPeers };
    }),
  removePeer: (peerId) =>
    set((state) => {
      const newPeers = new Map(state.peers);
      newPeers.delete(peerId);
      return { peers: newPeers };
    }),
  setPeers: (peers) =>
    set({ peers: new Map(peers.map((p) => [p.id, p])) }),

  // Locations
  locations: new Map(),
  updateLocation: (agentId, location) =>
    set((state) => {
      const newLocations = new Map(state.locations);
      newLocations.set(agentId, location);
      return { locations: newLocations };
    }),

  // Messages
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  // Connection status
  isConnected: false,
  setIsConnected: (connected) => set({ isConnected: connected }),

  // WebRTC connections
  peerConnections: new Map(),
  addPeerConnection: (peerId, connection) =>
    set((state) => {
      const newConnections = new Map(state.peerConnections);
      newConnections.set(peerId, connection);
      return { peerConnections: newConnections };
    }),
  removePeerConnection: (peerId) =>
    set((state) => {
      const newConnections = new Map(state.peerConnections);
      const connection = newConnections.get(peerId);
      if (connection) {
        connection.close();
      }
      newConnections.delete(peerId);
      return { peerConnections: newConnections };
    }),

  // UI state
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  activeTab: 'chat',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
