# Technical Stack

Complete overview of all technologies, libraries, and tools used in Mycelium.

## Technology Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Technology Layers                      │
└─────────────────────────────────────────────────────────┘

Frontend (Client)
    ├─ React 18              (UI Framework)
    ├─ TypeScript           (Type Safety)
    ├─ Vite                 (Build Tool)
    ├─ Tailwind CSS         (Styling)
    ├─ Leaflet.js           (Maps)
    ├─ Zustand              (State Management)
    └─ Lucide React         (Icons)

State Synchronization
    ├─ Yjs                  (CRDT Library)
    └─ WebRTC              (P2P Communication)

Backend (Server)
    ├─ Node.js 20          (Runtime)
    ├─ Express             (Web Framework)
    ├─ Socket.IO           (WebSocket)
    └─ CORS                (Security)

Common (Shared)
    ├─ TypeScript          (Shared Types)
    └─ GeoJSON             (Location Format)

Development
    ├─ Docker              (Containerization)
    ├─ npm Workspaces      (Monorepo)
    ├─ concurrently        (Process Management)
    └─ tsx                 (TypeScript Execution)

Optional/Future
    ├─ PostgreSQL          (Database)
    └─ Prisma              (ORM)
```

---

## Frontend Stack

### React 18

**Version**: 18.2.0
**Purpose**: UI framework for building interactive interfaces
**Why chosen**: Industry standard, excellent developer experience, large ecosystem

**Key Features Used**:
- Hooks (useState, useEffect, useRef, useMemo)
- Functional components
- React 18 concurrent features
- Component composition

**Dependencies**:
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

### TypeScript

**Version**: 5.x
**Purpose**: Static type checking and improved developer experience
**Why chosen**: Catch errors at compile time, better IDE support, self-documenting code

**Configuration**: `tsconfig.json` with strict mode enabled

**Key Features Used**:
- Strict null checks
- Interface definitions
- Type inference
- Discriminated unions

### Vite

**Version**: 5.x
**Purpose**: Fast build tool and dev server
**Why chosen**: Lightning-fast HMR, native ESM, better than CRA

**Features**:
- Hot Module Replacement (HMR)
- Fast cold start
- Optimized production builds
- TypeScript support out of the box

**Configuration**: `vite.config.ts`

### Tailwind CSS

**Version**: 3.x
**Purpose**: Utility-first CSS framework
**Why chosen**: Rapid development, consistent design, small production bundle

**Configuration**: `tailwind.config.js`

**Custom Theme**:
```javascript
{
  colors: {
    primary: '#4ECDC4',
    secondary: '#45B7D1',
    'gray-900': '#1a202c',
    // ... more colors
  }
}
```

### Leaflet.js

**Version**: 1.9.x
**Purpose**: Interactive map visualization
**Why chosen**: Open source, lightweight, excellent GeoJSON support

**Dependencies**:
```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1"
}
```

**Features Used**:
- Interactive maps
- Marker clustering
- GeoJSON layers
- Custom markers
- Popup windows

### Zustand

**Version**: 4.x
**Purpose**: Lightweight state management
**Why chosen**: Simple API, small bundle size, no boilerplate

**Store Definition**:
```typescript
interface AppState {
  currentAgent: Agent | null
  currentRoom: Room | null
  peers: Map<string, Agent>
  locations: Map<string, AgentLocation>
  messages: ChatMessage[]
  isConnected: boolean
  // ... more state
}
```

### Lucide React

**Version**: Latest
**Purpose**: Beautiful, consistent icons
**Why chosen**: Tree-shakeable, TypeScript support, modern design

**Icons Used**:
- MapPin (location tracking)
- Radio (connection status)
- Menu (sidebar toggle)
- Send (send message)
- Users (agents list)

---

## State Synchronization Stack

### Yjs

**Version**: 13.x
**Purpose**: CRDT library for conflict-free synchronization
**Why chosen**: Battle-tested, excellent performance, multiple data structures

**Dependencies**:
```json
{
  "yjs": "^13.6.10"
}
```

**Data Structures Used**:

1. **Y.Map** (Agents)
```typescript
yAgents = ydoc.getMap('agents')
yAgents.set(agentId, agent)
```

2. **Y.Map** (Locations)
```typescript
yLocations = ydoc.getMap('locations')
yLocations.set(agentId, location)
```

3. **Y.Array** (Messages)
```typescript
yMessages = ydoc.getArray('messages')
yMessages.push([message])
```

**Key Features**:
- Conflict-free replication
- Efficient binary encoding
- Offline support
- Undo/redo (not yet implemented)

### WebRTC

**Version**: Native browser API
**Purpose**: Peer-to-peer communication
**Why chosen**: Industry standard, built into browsers, encrypted by default

**Configuration**:
```typescript
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
]
```

**APIs Used**:
- RTCPeerConnection
- RTCDataChannel
- RTCIceCandidate
- RTCSessionDescription

**Security**: DTLS encryption (built-in)

---

## Backend Stack

### Node.js 20

**Version**: 20.x LTS
**Purpose**: JavaScript runtime for server
**Why chosen**: Modern features, long-term support, excellent performance

**Features Used**:
- ES Modules
- Async/await
- Native fetch (Node 18+)
- Performance improvements

### Express

**Version**: 4.x
**Purpose**: Minimal web framework
**Why chosen**: Industry standard, large ecosystem, simple API

**Dependencies**:
```json
{
  "express": "^4.18.2"
}
```

**Endpoints**:
```typescript
GET  /health         // Health check
GET  /rooms/:roomId  // Room info
```

### Socket.IO

**Version**: 4.x
**Purpose**: Real-time bidirectional communication
**Why chosen**: Reliable, auto-reconnection, room support

**Dependencies**:
```json
{
  "socket.io": "^4.6.1",
  "socket.io-client": "^4.6.1"
}
```

**Events**:
```typescript
// Server → Client
'connect'
'room-peers'
'peer-joined'
'peer-left'
'offer'
'answer'
'ice-candidate'

// Client → Server
'join-room'
'leave-room'
'offer'
'answer'
'ice-candidate'
```

**Configuration**:
```typescript
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
})
```

### CORS

**Version**: Built-in with Express
**Purpose**: Cross-origin resource sharing
**Configuration**:
```typescript
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))
```

---

## Common Stack

### Shared Types

Location: `common/src/types.ts`

**Key Interfaces**:

```typescript
export interface Agent {
  id: string
  name: string
  role: 'field' | 'command' | 'volunteer' | 'police' | 'fire' | 'national-guard'
  publicKey?: string
  joinedAt: number
  color: string
}

export interface AgentLocation extends Feature<Point> {
  properties: {
    agentId: string
    timestamp: number
    accuracy?: number
    heading?: number
    speed?: number
    altitude?: number
  }
}

export interface ChatMessage {
  id: string
  agentId: string
  agentName: string
  content: string
  timestamp: number
  type: 'text' | 'system' | 'emergency'
}

export interface Room {
  id: string
  name: string
  description?: string
  createdAt: number
  createdBy: string
  accessToken?: string
}
```

### Shared Utilities

Location: `common/src/utils.ts`

```typescript
generateId(): string
generateColor(): string
createLocationFeature(): AgentLocation
calculateDistance(lat1, lng1, lat2, lng2): number
formatTime(timestamp): string
isValidRoomId(roomId): boolean
sanitizeInput(input): string
```

### GeoJSON

**Standard**: RFC 7946
**Purpose**: Standard format for geographic data
**Why chosen**: Open standard, widely supported, perfect for location data

**Example**:
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749]
  },
  "properties": {
    "agentId": "agent-123",
    "timestamp": 1699123456789
  }
}
```

---

## Development Stack

### Docker

**Version**: Latest
**Purpose**: Containerization and consistent environments
**Why chosen**: Easy deployment, environment consistency

**Images**:
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
  server:
    build: ./server
  client:
    build: ./client
```

**Multi-stage Builds**:
```dockerfile
# Build stage
FROM node:20-alpine AS builder
# Build application

# Production stage
FROM node:20-alpine AS production
# Copy artifacts, run
```

### npm Workspaces

**Purpose**: Monorepo management
**Why chosen**: Native npm support, simple, effective

**Structure**:
```json
{
  "workspaces": [
    "client",
    "server",
    "common"
  ]
}
```

**Benefits**:
- Shared dependencies
- Cross-package imports
- Unified scripts

### concurrently

**Purpose**: Run multiple npm scripts in parallel
**Why chosen**: Simple, works cross-platform

**Usage**:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\""
  }
}
```

### tsx

**Purpose**: Execute TypeScript without compilation
**Why chosen**: Fast, no build step needed for dev

**Usage**:
```json
{
  "scripts": {
    "dev:server": "tsx watch server/src/index.ts"
  }
}
```

---

## Optional/Future Stack

### PostgreSQL

**Version**: 16
**Purpose**: Relational database for persistent storage
**Status**: ⏳ Optional (not yet integrated)

**Planned Use Cases**:
- Room persistence
- User registry
- Historical data
- Audit logs

### Prisma

**Version**: 5.x
**Purpose**: Type-safe database ORM
**Status**: ⏳ Not yet implemented

**Schema Example**:
```prisma
model Room {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  agents    Agent[]
}

model Agent {
  id       String  @id
  name     String
  role     String
  roomId   String?
  room     Room?   @relation(fields: [roomId], references: [id])
}
```

---

## Development Tools

### ESLint

**Purpose**: Code linting
**Configuration**: Standard React/TypeScript rules

### Prettier

**Purpose**: Code formatting
**Configuration**: Consistent formatting across codebase

### Git

**Purpose**: Version control
**Workflow**: Feature branches, pull requests

---

## Browser Compatibility

### Required Browser APIs

| API | Purpose | Availability |
|-----|---------|-------------|
| WebRTC | P2P communication | All modern browsers |
| Geolocation | Location tracking | All modern browsers |
| WebSocket | Signaling | All modern browsers |
| IndexedDB | Local storage (future) | All modern browsers |
| Service Workers | Offline support (future) | All modern browsers |

### Minimum Browser Versions

- Chrome: 90+
- Firefox: 88+
- Safari: 15+
- Edge: 90+

**Not Supported**: Internet Explorer

---

## Deployment Stack

### Production

**Client Deployment**:
- Nginx (static file server)
- SSL/TLS (Let's Encrypt)
- Gzip compression

**Server Deployment**:
- Node.js 20 Alpine
- PM2 (process manager)
- Docker container

**Database** (optional):
- PostgreSQL in Docker
- Automated backups

### Development

**Local Development**:
```bash
npm run dev
# Client: http://localhost:5173
# Server: http://localhost:8001
```

**Docker Development**:
```bash
docker-compose up
# All services in containers
```

---

## Dependencies Summary

### Client Package (`client/package.json`)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-leaflet": "^4.2.1",
    "leaflet": "^1.9.4",
    "yjs": "^13.6.10",
    "socket.io-client": "^4.6.1",
    "zustand": "^4.4.7",
    "lucide-react": "^0.294.0",
    "@swarmtech/common": "*"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/leaflet": "^1.9.8",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

### Server Package (`server/package.json`)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.6.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "@swarmtech/common": "*"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.6",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0"
  }
}
```

### Common Package (`common/package.json`)

```json
{
  "dependencies": {
    "geojson": "^0.5.0"
  },
  "devDependencies": {
    "@types/geojson": "^7946.0.13",
    "typescript": "^5.3.3"
  }
}
```

---

## Technology Decisions Rationale

### Why React over Vue/Svelte?
- ✅ Larger ecosystem
- ✅ More developers familiar
- ✅ Excellent TypeScript support
- ✅ Mature tooling

### Why Vite over Webpack/CRA?
- ✅ Much faster development
- ✅ Better DX
- ✅ Optimized production builds
- ✅ Native ESM support

### Why Yjs over Automerge?
- ✅ Better performance
- ✅ Smaller bundle size
- ✅ More data structures
- ✅ Active development

### Why Socket.IO over Native WebSocket?
- ✅ Auto-reconnection
- ✅ Room support
- ✅ Fallback transports
- ✅ Better browser compatibility

### Why Zustand over Redux?
- ✅ Much simpler API
- ✅ Less boilerplate
- ✅ Smaller bundle size
- ✅ Hooks-first design

### Why Leaflet over Google Maps?
- ✅ Open source
- ✅ No API key required
- ✅ Lighter weight
- ✅ Great GeoJSON support

---

## Performance Characteristics

### Bundle Sizes (Production)

| Package | Size (gzipped) |
|---------|----------------|
| Client JS | ~250KB |
| Client CSS | ~20KB |
| Vendor libs | ~200KB |
| **Total** | **~470KB** |

### Load Times

- Initial page load: 1-2s
- Time to interactive: 2-3s
- First location update: <5s

### Runtime Performance

- Memory usage: 50-100MB
- CPU usage: Low (idle)
- CPU usage: Medium (4 peers active)
- WebRTC bandwidth: ~10KB/s per peer

---

For more information:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [HOW_IT_WORKS.md](./HOW_IT_WORKS.md) - How everything works
- [FEATURES.md](./FEATURES.md) - Feature list
