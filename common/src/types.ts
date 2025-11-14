import { Feature, Point } from 'geojson';

/**
 * User/Agent identity
 */
export interface Agent {
  id: string;
  name: string;
  role: 'field' | 'command' | 'volunteer' | 'police' | 'fire' | 'national-guard';
  publicKey?: string; // For cryptographic verification
  joinedAt: number;
  color: string; // For map visualization
}

/**
 * Location data in GeoJSON format
 */
export interface AgentLocation extends Feature<Point> {
  properties: {
    agentId: string;
    timestamp: number;
    accuracy?: number; // meters
    heading?: number; // degrees
    speed?: number; // m/s
    altitude?: number; // meters
  };
}

/**
 * Chat message
 */
export interface ChatMessage {
  id: string;
  agentId: string;
  agentName: string;
  content: string;
  timestamp: number;
  type: 'text' | 'system' | 'emergency';
}

/**
 * Room/Team information
 */
export interface Room {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  createdBy: string;
  accessToken?: string; // Optional access control
}

/**
 * WebRTC Signaling Messages
 */
export type SignalingMessage =
  | { type: 'offer'; sdp: string; from: string; to: string }
  | { type: 'answer'; sdp: string; from: string; to: string }
  | { type: 'ice-candidate'; candidate: RTCIceCandidateInit; from: string; to: string }
  | { type: 'join-room'; roomId: string; agent: Agent }
  | { type: 'leave-room'; roomId: string; agentId: string }
  | { type: 'room-peers'; roomId: string; peers: Agent[] }
  | { type: 'peer-joined'; roomId: string; peer: Agent }
  | { type: 'peer-left'; roomId: string; peerId: string };

/**
 * Application state synchronized via CRDT
 */
export interface SwarmState {
  agents: Map<string, Agent>;
  locations: Map<string, AgentLocation>;
  messages: ChatMessage[];
  room: Room | null;
}

/**
 * WebRTC Connection State
 */
export interface PeerConnection {
  peerId: string;
  connection: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
  state: RTCPeerConnectionState;
}

/**
 * Configuration
 */
export interface SwarmConfig {
  signaling: {
    url: string;
    reconnectDelay: number;
  };
  webrtc: {
    iceServers: RTCIceServer[];
    dataChannelConfig?: RTCDataChannelInit;
  };
  ui: {
    mapCenter: [number, number]; // [lat, lng]
    mapZoom: number;
    updateInterval: number; // ms
  };
}
