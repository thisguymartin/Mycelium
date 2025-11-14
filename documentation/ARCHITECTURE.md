# Mycelium Architecture

## System Architecture Overview

Mycelium uses a **hybrid peer-to-peer architecture** that combines the benefits of both centralized and decentralized systems.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Mycelium System                             │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│   Field Agent Browser    │         │   Command Center Browser │
│  ┌────────────────────┐  │         │  ┌────────────────────┐  │
│  │   React Client     │  │         │  │   React Client     │  │
│  │  ┌──────────────┐  │  │         │  │  ┌──────────────┐  │  │
│  │  │ Yjs CRDT     │  │  │         │  │  │ Yjs CRDT     │  │  │
│  │  │ State Layer  │  │  │         │  │  │ State Layer  │  │  │
│  │  └──────────────┘  │  │         │  │  └──────────────┘  │  │
│  │  ┌──────────────┐  │  │         │  │  ┌──────────────┐  │  │
│  │  │ WebRTC P2P   │  │  │         │  │  │ WebRTC P2P   │  │  │
│  │  │ Connections  │◄─┼──┼─────────┼──┼─►│ Connections  │  │  │
│  │  └──────────────┘  │  │  Mesh   │  │  └──────────────┘  │  │
│  │  ┌──────────────┐  │  │  Network│  │  ┌──────────────┐  │  │
│  │  │ Map + Chat   │  │  │         │  │  │ Map + Chat   │  │  │
│  │  │ UI Components│  │  │         │  │  │ UI Components│  │  │
│  │  └──────────────┘  │  │         │  │  └──────────────┘  │  │
│  └────────────────────┘  │         │  └────────────────────┘  │
└───────────┬──────────────┘         └──────────────┬───────────┘
            │                                       │
            │  WebSocket (Initial Signaling Only)   │
            └───────────────┬───────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   Signaling    │
                    │     Server     │
                    │  (Node.js +    │
                    │  Socket.IO)    │
                    └────────┬───────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │   (Optional)    │
                    │ - User Registry │
                    │ - Room State    │
                    └─────────────────┘
```

## Architectural Layers

### 1. Presentation Layer (Client UI)

**Technology**: React 18 + TypeScript + Tailwind CSS

**Components**:
- `App.tsx` - Main application controller
- `Map.tsx` - Leaflet map with real-time location markers
- `Chat.tsx` - Real-time chat interface
- `Sidebar.tsx` - Navigation and UI shell
- `JoinRoom.tsx` - Room joining interface

**Responsibilities**:
- Render user interface
- Handle user interactions
- Display synchronized state from store
- Manage location tracking via Geolocation API

### 2. State Management Layer

**Technology**: Zustand (local) + Yjs (distributed)

**Structure**:
```typescript
interface AppState {
  // Local identity
  currentAgent: Agent | null
  currentRoom: Room | null

  // Connected peers
  peers: Map<string, Agent>
  peerConnections: Map<string, RTCPeerConnection>

  // Synchronized state (via CRDT)
  locations: Map<string, AgentLocation>
  messages: ChatMessage[]

  // UI state
  isConnected: boolean
  isSidebarOpen: boolean
  activeTab: 'chat' | 'agents' | 'settings'
}
```

**Responsibilities**:
- Single source of truth for UI state
- Local state management (Zustand)
- Distributed state synchronization (Yjs CRDTs)
- Subscribe to CRDT updates
- Trigger UI re-renders

### 3. CRDT Synchronization Layer

**Technology**: Yjs

**Data Structures**:
```typescript
ydoc.getMap('agents')      // Y.Map<Agent>
ydoc.getMap('locations')   // Y.Map<AgentLocation>
ydoc.getArray('messages')  // Y.Array<ChatMessage>
```

**Responsibilities**:
- Conflict-free state replication
- Automatic conflict resolution
- Idempotent update application
- Broadcast state changes to all peers
- Maintain eventual consistency

**Why CRDTs?**
- **Conflict-free**: Multiple simultaneous edits merge automatically
- **Offline-first**: Works disconnected, syncs when reconnected
- **Idempotent**: Same update applied multiple times = same result
- **Order-independent**: Converges regardless of message order

### 4. P2P Communication Layer

**Technology**: WebRTC Data Channels

**Responsibilities**:
- Direct peer-to-peer connections
- Reliable ordered data delivery
- NAT traversal via STUN servers
- Connection state management
- Broadcast Yjs updates to all peers

**WebRTC Flow**:
```
1. Create RTCPeerConnection
2. Create data channel
3. Create SDP offer
4. Exchange offer/answer via signaling server
5. Exchange ICE candidates
6. Data channel opens → direct P2P connection
7. Signaling server no longer needed
```

### 5. Signaling Layer

**Technology**: Socket.IO (WebSocket)

**Responsibilities**:
- Bootstrap WebRTC connections
- Exchange SDP offers/answers
- Relay ICE candidates
- Notify peers of joins/leaves
- Room management

**Important**: Signaling server is **only needed for connection setup**. After peers connect, all communication is direct P2P.

### 6. Persistence Layer (Optional)

**Technology**: PostgreSQL (optional for future features)

**Responsibilities**:
- Store room metadata
- User registry (future)
- Historical session data (future)
- Public key infrastructure (future)

## Design Patterns

### 1. Hybrid P2P with Signaling Server

```
    Client A ◄──────WebRTC (P2P)──────► Client B
        │                                   │
        │          (Used only for)         │
        │          connection setup         │
        │                                   │
        └─────WebSocket (Signaling)────────┘
                      ↓
                Signaling Server
                   (Temporary)
```

**Benefits**:
- **Scalability**: Signaling server has minimal workload
- **Privacy**: Data never goes through server
- **Resilience**: Server outage doesn't affect existing communications
- **Simplicity**: Easy to deploy and configure

### 2. CRDT Pattern (Yjs)

**Why CRDTs instead of Operational Transform?**

| Aspect | CRDT (Yjs) | Operational Transform |
|--------|------------|----------------------|
| **Conflict Resolution** | Automatic | Requires central server |
| **Offline Support** | Native | Complex |
| **Implementation** | Simpler | Complex |
| **Consistency** | Eventual | Strong |
| **Best For** | Distributed systems | Centralized systems |

**Yjs Data Structures Used**:
- `Y.Map` - Key-value maps for agents and locations
- `Y.Array` - Ordered list for messages (maintains chronological order)

### 3. Service Layer Pattern

```
React Components
       ↓
    Store (Zustand)
       ↓
  CRDT Service (Yjs)
       ↓
  WebRTC Service
       ↓
  Socket.IO Client
```

**Benefits**:
- Clear separation of concerns
- Testable service layer
- Easy to swap implementations
- Type-safe interfaces

### 4. Observer Pattern

CRDT service uses observers for reactive updates:

```typescript
crdt.onAgentsChange((agents) => {
  // React to agent changes
  agents.forEach(addPeer)
})

crdt.onLocationsChange((locations) => {
  // React to location updates
  locations.forEach(updateLocation)
})

crdt.onMessagesChange((messages) => {
  // React to new messages
  messages.forEach(addMessage)
})
```

## Component Architecture

### Client Application Structure

```
client/
├── src/
│   ├── App.tsx                    # Main application controller
│   ├── main.tsx                   # React entry point
│   ├── store.ts                   # Zustand state management
│   │
│   ├── components/                # React components
│   │   ├── Map.tsx               # Leaflet map component
│   │   ├── Chat.tsx              # Chat interface
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   └── JoinRoom.tsx          # Room joining UI
│   │
│   └── services/                  # Business logic
│       ├── crdt.ts               # CRDT service (Yjs)
│       └── webrtc.ts             # WebRTC connection manager
```

### Server Application Structure

```
server/
└── src/
    └── index.ts                   # Express + Socket.IO server
        ├── Room management
        ├── Peer tracking
        ├── WebRTC signaling
        └── Health endpoints
```

### Common Package Structure

```
common/
└── src/
    ├── types.ts                   # Shared TypeScript types
    ├── utils.ts                   # Shared utility functions
    └── index.ts                   # Package exports
```

## Network Topology

### Mesh Network

Mycelium uses a **full mesh topology** where each peer connects to all other peers:

```
     Peer A ────────── Peer B
       │    ╲        ╱    │
       │     ╲      ╱     │
       │      ╲    ╱      │
       │       ╲  ╱       │
     Peer D ────────── Peer C
```

**Characteristics**:
- Each peer has N-1 connections (N = number of peers)
- No single point of failure
- Maximum redundancy
- Optimal for small groups (2-8 peers)

**Scaling Considerations**:

| Peers | Connections per Peer | Performance | Recommendation |
|-------|---------------------|-------------|----------------|
| 2-3   | 1-2                 | Excellent   | Optimal |
| 4-5   | 3-4                 | Good        | Recommended |
| 6-8   | 5-7                 | Degraded    | Functional |
| 8+    | 7+                  | Poor        | Split into sub-teams |

### For Large Operations

**Team Partitioning**:
```
Team Alpha (Room: team-alpha)     Team Bravo (Room: team-bravo)
  - Agent 1                          - Agent 5
  - Agent 2                          - Agent 6
  - Agent 3                          - Agent 7
  - Agent 4                          - Agent 8

Command Center (Bridge Node - Future)
  - Monitors both rooms
  - Relays critical information
```

## Data Flow Architecture

### Location Update Flow

```
User A moves
    ↓
Navigator.geolocation.watchPosition()
    ↓
createLocationFeature(lat, lng, metadata)
    ↓
CRDTService.updateLocation(agentId, location)
    ↓
yLocations.set(agentId, location)
    ↓
Yjs encodes change as binary update
    ↓
WebRTCService.broadcast(update)
    ↓
[WebRTC Data Channels to all peers]
    ↓
Peer B receives update
    ↓
Y.applyUpdate(ydoc, update)
    ↓
CRDT observer triggers callback
    ↓
Store updates location
    ↓
React re-renders Map component
    ↓
User B sees User A's new location
```

### Message Flow

```
User A types message
    ↓
createChatMessage(content)
    ↓
CRDTService.addMessage(message)
    ↓
yMessages.push([message])
    ↓
Yjs update event fires
    ↓
WebRTC broadcasts to all peers
    ↓
All peers receive update
    ↓
Y.applyUpdate (idempotent)
    ↓
Store adds message (if new)
    ↓
Chat component re-renders
    ↓
Message appears for all users
```

### Connection Establishment Flow

```
User A joins room
    ↓
Socket.IO connects to signaling server
    ↓
emit('join-room', { roomId, agent })
    ↓
Server adds to room, returns existing peers
    ↓
emit('room-peers', { peers: [B, C, D] })
    ↓
For each peer, create WebRTC connection:
    ↓
createPeerConnection(peer, initiator=true)
    ↓
createDataChannel('mycelium')
    ↓
createOffer() → setLocalDescription()
    ↓
emit('offer', { sdp, to: peer.id })
    ↓
Server forwards to peer
    ↓
Peer receives offer → setRemoteDescription()
    ↓
createAnswer() → setLocalDescription()
    ↓
emit('answer', { sdp, to: agent.id })
    ↓
Agent receives answer → setRemoteDescription()
    ↓
Exchange ICE candidates
    ↓
WebRTC connection established
    ↓
Data channel opens
    ↓
Sync Yjs state
    ↓
✓ Peers connected!
```

## Security Architecture

### Current Security Measures

1. **WebRTC DTLS Encryption**
   - All P2P data encrypted by default
   - Industry-standard encryption (AES)
   - Perfect forward secrecy

2. **Transport Security**
   - HTTPS in production
   - WSS (WebSocket Secure) for signaling
   - CORS protection on server

3. **Input Validation**
   - Room ID validation (regex)
   - Content sanitization (max length, trim)
   - Safe GeoJSON parsing

### Future Security Enhancements (Planned)

1. **Authentication**
   - User login system
   - Session management
   - Token-based auth

2. **Authorization**
   - Room access control
   - Role-based permissions
   - Invite-only rooms

3. **Message Signing**
   - Public key infrastructure
   - Message verification
   - Identity proofs

4. **Audit Trail**
   - Action logging
   - Tamper-proof logs
   - Forensic analysis

## Deployment Architecture

### Development (Docker Compose)

```yaml
services:
  postgres:5432    # Optional database
  server:8001      # Node.js signaling server
  client:5173      # React dev server (Vite)
```

### Production (Containerized)

**Client**: Multi-stage build (Node.js build → Nginx static server)
**Server**: Multi-stage build (Node.js build → Alpine runtime)

**Environment Variables**:
```bash
# Server
PORT=8001
NODE_ENV=production
CLIENT_URL=https://mycelium.example.com
DATABASE_URL=postgresql://...

# Client
VITE_SIGNALING_SERVER=https://signal.mycelium.example.com
```

## Design Principles

### 1. Local-First
- All state lives locally
- Server only bootstraps connections
- Works offline by default

### 2. Progressive Enhancement
- Basic features work with minimal connectivity
- Enhanced features available with better network
- Graceful degradation

### 3. Zero-Configuration
- Sensible defaults for everything
- Works out of the box
- Optional advanced configuration

### 4. Type Safety
- Full TypeScript coverage
- Shared type definitions
- Compile-time error checking

### 5. Separation of Concerns
- Services isolated from UI
- Clear layer boundaries
- Testable components

### 6. Scalability-Aware
- Designed for 2-8 peer meshes
- Team partitioning for larger ops
- Future-ready for bridge nodes

## Technology Decisions

### Why WebRTC?
- ✅ Industry standard for P2P
- ✅ Built into all modern browsers
- ✅ NAT traversal support (STUN/TURN)
- ✅ Encrypted by default
- ✅ Low latency
- ❌ Complex API (abstracted by our service)

### Why Yjs?
- ✅ Battle-tested CRDT library
- ✅ Excellent performance
- ✅ Multiple data structures
- ✅ Great documentation
- ✅ Active development
- ❌ Learning curve (abstracted by our service)

### Why React?
- ✅ Industry standard
- ✅ Large ecosystem
- ✅ Great developer experience
- ✅ Fast development
- ❌ Bundle size (mitigated by Vite)

### Why Socket.IO?
- ✅ Reliable WebSocket abstraction
- ✅ Auto-reconnection
- ✅ Room support
- ✅ Fallback transports
- ❌ Slightly heavier than raw WebSocket

### Why Leaflet?
- ✅ Open source mapping
- ✅ Lightweight
- ✅ Great GeoJSON support
- ✅ Extensible
- ❌ Not as feature-rich as Google Maps

## Performance Characteristics

### Latency
- **P2P messaging**: 20-100ms
- **Location updates**: Real-time (depends on GPS)
- **CRDT convergence**: Instantaneous to seconds
- **Initial connection**: 1-3 seconds

### Bandwidth
- **Per peer connection**: ~10KB/s active
- **Location update**: ~200 bytes
- **Chat message**: ~100-500 bytes
- **Initial sync**: ~5-50KB (depends on history)

### Storage
- **Local state**: ~1MB per hour
- **Map tiles**: ~10-100MB (if cached offline)
- **Session data**: Minimal (no persistent storage yet)

### CPU/Memory
- **Idle**: Minimal impact
- **Active (4 peers)**: Moderate CPU, ~50-100MB RAM
- **Active (8 peers)**: Higher CPU, ~100-200MB RAM

## Future Architecture Evolution

### Phase 1: Current (Prototype)
- ✅ Basic P2P mesh
- ✅ CRDT synchronization
- ✅ Map + Chat

### Phase 2: PWA (Planned)
- 🔄 Offline-first PWA
- 🔄 Service workers
- 🔄 Local database (SQLite/Turso)
- 🔄 Push notifications

### Phase 3: Mobile (Planned)
- 📱 React Native apps
- 📱 Native location APIs
- 📱 Background sync

### Phase 4: Scale (Future)
- 🔮 Bridge nodes
- 🔮 Multi-team federation
- 🔮 Voice/video channels
- 🔮 File sharing (IPFS)

### Phase 5: Intelligence (Future)
- 🤖 AI situation analysis
- 🤖 Automated task assignment
- 🤖 Predictive routing
- 🤖 Natural language interface

---

For more details on specific aspects:
- **How it works**: [HOW_IT_WORKS.md](./HOW_IT_WORKS.md)
- **Data flows**: [DATA_FLOWS.md](./DATA_FLOWS.md)
- **Technical stack**: [TECHNICAL_STACK.md](./TECHNICAL_STACK.md)
