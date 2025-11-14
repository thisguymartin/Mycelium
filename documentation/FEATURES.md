# Mycelium Features

Complete list of current features and planned enhancements.

## Current Features

### ✅ Core Functionality

#### 1. Peer-to-Peer Communication
- **WebRTC Data Channels**: Direct encrypted communication between peers
- **Mesh Networking**: Each peer connects to all other peers
- **NAT Traversal**: STUN servers for connection through firewalls
- **Auto-reconnection**: Socket.IO handles network interruptions
- **Connection Status**: Real-time indicators of connection state

#### 2. Real-Time Location Sharing
- **GPS Tracking**: Native browser geolocation API
- **Interactive Maps**: Leaflet.js with OpenStreetMap tiles
- **Location Markers**: Color-coded markers for each agent
- **Demo Mode**: Fallback location if GPS unavailable
- **Continuous Updates**: Watch position for movement tracking
- **GeoJSON Format**: Standard geographic data format

**Metadata Tracked**:
- Latitude & Longitude
- Accuracy (meters)
- Heading (degrees)
- Speed (m/s)
- Altitude (meters)
- Timestamp

#### 3. Text Chat
- **Real-time Messaging**: Instant message delivery to all peers
- **Message Types**: Text, system, and emergency messages
- **Synchronized History**: All peers see same message history
- **Conflict-Free**: CRDT ensures correct message ordering
- **User Attribution**: See who sent each message

#### 4. CRDT Synchronization
- **Yjs Integration**: Conflict-free replicated data types
- **Automatic Merge**: Concurrent edits merge automatically
- **Eventual Consistency**: All peers converge to same state
- **Offline Support**: Changes queue and sync when reconnected
- **Idempotent**: Same update applied multiple times = same result

#### 5. Room Management
- **Room Creation**: Create rooms with unique IDs
- **Room Joining**: Join existing rooms with room code
- **Peer Discovery**: Automatic discovery of room members
- **Room Persistence**: Rooms exist as long as members present
- **Auto-cleanup**: Empty rooms automatically deleted

#### 6. Multi-Role Support
Six agent roles:
- **Field Agent**: Frontline responders
- **Command Center**: Coordination hub
- **Volunteer**: Community helpers
- **Police**: Law enforcement
- **Fire**: Fire department
- **National Guard**: Military support

Each role has:
- Unique color coding
- Role-based identification
- Future: Role-based permissions

#### 7. User Interface
- **Modern Design**: Clean, intuitive interface
- **Responsive Layout**: Works on desktop and mobile
- **Dark Theme**: Easy on eyes in 24/7 operations
- **Sidebar Navigation**: Tabbed interface for different views
- **Status Indicators**: Connection and location tracking status
- **Iconography**: Clear visual communication

**UI Components**:
- Welcome/Join screen
- Interactive map (full screen)
- Collapsible sidebar
- Chat interface
- Agents list
- Settings panel (future)

#### 8. Development Experience
- **TypeScript**: Full type safety
- **Hot Module Replacement**: Instant updates during development
- **Docker Support**: One-command deployment
- **npm Scripts**: Comprehensive automation
- **Monorepo Structure**: Organized codebase
- **Zero Configuration**: Works out of the box

---

## Planned Features (Implementation Plan)

### 🔄 Phase 1: Offline-First (High Priority)

#### 1. Progressive Web App (PWA)
- **Service Workers**: Cache application for offline use
- **Installable**: Add to home screen on mobile
- **Offline Maps**: Cache map tiles for offline access
- **App Manifest**: PWA metadata and icons
- **Background Sync**: Queue updates when offline

#### 2. Local Database (SQLite + Turso)
- **Client-side Storage**: SQLite in browser via sql.js
- **Cloud Sync**: Turso for when online
- **Offline Queue**: Store changes while offline
- **Automatic Sync**: Merge when connection restored
- **Type-safe ORM**: Drizzle for database operations

**Tables**:
- agents
- locations
- messages
- tasks
- check-ins
- sos_alerts
- map_tiles
- sync_queue
- settings

#### 3. Offline Map Tiles
- **Tile Caching**: IndexedDB storage for tiles
- **Area Download**: Pre-download specific regions
- **Progress Tracking**: Show download progress
- **Storage Management**: Limit tile cache size
- **Tile Expiration**: Auto-refresh old tiles

---

### 🔄 Phase 2: Emergency Features (High Priority)

#### 4. SOS/Panic Button
- **Emergency Alert**: Large, accessible panic button
- **Confirmation**: 3-second countdown to prevent accidents
- **Broadcast**: Alert all team members instantly
- **Location Attached**: Current GPS coordinates included
- **Visual Alert**: Prominent banner for all users
- **Audio Alert**: Sound notification
- **Acknowledgment**: Track who received alert
- **Status Tracking**: Active/Acknowledged/Resolved

**Features**:
```typescript
interface SOSAlert {
  id: string
  agentId: string
  agentName: string
  latitude: number
  longitude: number
  message?: string
  status: 'active' | 'acknowledged' | 'resolved'
  acknowledgedBy: string[]
  resolvedBy?: string
  timestamp: number
}
```

#### 5. Check-in System
- **Periodic Check-ins**: Configurable interval (default 30 min)
- **Status Options**: Safe / Needs Help / Emergency
- **Automatic Reminders**: Notification before due time
- **Missed Check-in Alerts**: Auto-alert if missed
- **Location Capture**: GPS coordinates with check-in
- **Notes Field**: Optional status notes
- **History Tracking**: See check-in history

**Configuration**:
- Enable/disable check-ins
- Set interval (minutes)
- Auto-alert on missed
- Reminder time before due

---

### 🔄 Phase 3: Collaboration Features (Medium Priority)

#### 6. Task Assignment System
- **Task Creation**: Create tasks with details
- **Assignment**: Assign to specific agents
- **Priority Levels**: Low / Medium / High / Emergency
- **Status Tracking**: Pending / In Progress / Completed
- **Location Attachment**: Tasks tied to map locations
- **Deadlines**: Set due dates
- **Filtering**: View all / my tasks / unassigned
- **Real-time Sync**: CRDT-synchronized tasks

**Task Structure**:
```typescript
interface Task {
  id: string
  title: string
  description?: string
  assignedTo: string[]
  createdBy: string
  priority: 'low' | 'medium' | 'high' | 'emergency'
  status: 'pending' | 'in-progress' | 'completed'
  location?: { latitude: number; longitude: number }
  deadline?: number
  completedAt?: number
  createdAt: number
  updatedAt: number
}
```

#### 7. QR Code Peer Discovery
- **Direct Connection**: Connect without signaling server
- **QR Generation**: Create connection QR code
- **QR Scanning**: Camera-based QR scanner
- **Mesh Support**: Perfect for offline mesh networks
- **Security**: Encrypted offer/answer in QR
- **Fast Setup**: Connect in seconds

**Use Cases**:
- Mesh networks without internet
- Quick team member addition
- Offline operation coordination
- Disaster scenarios without infrastructure

---

### 🔄 Phase 4: User Experience (Medium Priority)

#### 8. Dark Mode
- **Theme Options**: Light / Dark / System
- **Persistent**: Saves preference
- **Smooth Transition**: Animated theme changes
- **Full Coverage**: All components themed
- **System Detection**: Respects OS preference

#### 9. Push Notifications
- **Browser Notifications**: Native notifications
- **Permission Management**: Request when needed
- **Event Types**:
  - New messages
  - SOS alerts
  - Missed check-ins
  - Task assignments
  - Peer joins/leaves
- **Notification Actions**: Quick actions from notification

---

### 📱 Phase 5: Mobile (Future)

#### 10. React Native Apps
- **iOS & Android**: Native mobile applications
- **Native GPS**: Better location accuracy
- **Background Tracking**: Continue tracking in background
- **Push Notifications**: Native push support
- **Offline-first**: Full offline capability
- **Shared Codebase**: Reuse logic from web app

#### 11. Enhanced Mobile Features
- **Battery Optimization**: Efficient location tracking
- **Network Awareness**: Adapt to connection quality
- **Cellular Data Management**: Minimize data usage
- **Wake Lock**: Keep app active when needed
- **Haptic Feedback**: Tactile notifications

---

### 🔮 Phase 6: Advanced Features (Future)

#### 12. Voice & Video Communication
- **WebRTC Media**: Audio and video channels
- **Group Calls**: Multi-user conferences
- **One-on-One**: Direct calls between agents
- **Screen Sharing**: Share maps or documents
- **Recording**: Optional call recording (with consent)

#### 13. File Sharing
- **P2P File Transfer**: Direct file sharing via WebRTC
- **IPFS Integration**: Decentralized file storage
- **File Types**:
  - Photos from scene
  - Documents
  - Maps
  - Videos
- **Offline Access**: Cached files available offline

#### 14. Advanced CRDT Features
- **Collaborative Mapping**: Edit maps together
- **Shared Documents**: Real-time document editing
- **Drawing Tools**: Annotate maps
- **Undo/Redo**: Navigate change history
- **Version History**: See document evolution

#### 15. Bridge Nodes
- **Multi-Team Coordination**: Connect multiple rooms
- **Hierarchical Structure**: Teams → Squads → Command
- **Selective Relay**: Control information flow
- **Load Balancing**: Distribute connection load
- **Redundancy**: Multiple bridges for reliability

#### 16. AI Features
- **Situation Analysis**: Automatic threat assessment
- **Resource Allocation**: Suggest optimal task assignments
- **Route Planning**: Best paths between locations
- **Predictive Analytics**: Anticipate needs
- **Natural Language**: Voice commands
- **Automated Reports**: Generate status reports

#### 17. Enhanced Security
- **End-to-End Encryption**: Message signing
- **Public Key Infrastructure**: Identity verification
- **Access Control**: Room permissions
- **Authentication**: User login system
- **Audit Trail**: Tamper-proof logs
- **Role Permissions**: Fine-grained access control

---

## Feature Comparison

### Current vs. Planned

| Feature | Status | Priority |
|---------|--------|----------|
| **P2P Communication** | ✅ Complete | - |
| **Location Sharing** | ✅ Complete | - |
| **Text Chat** | ✅ Complete | - |
| **CRDT Sync** | ✅ Complete | - |
| **Room Management** | ✅ Complete | - |
| **Multi-Role Support** | ✅ Complete | - |
| **PWA** | 🔄 Planned | High |
| **Local Database** | 🔄 Planned | High |
| **Offline Maps** | 🔄 Planned | High |
| **SOS Button** | 🔄 Planned | High |
| **Check-ins** | 🔄 Planned | High |
| **Task Assignment** | 🔄 Planned | Medium |
| **QR Discovery** | 🔄 Planned | Medium |
| **Dark Mode** | 🔄 Planned | Medium |
| **Push Notifications** | 🔄 Planned | Medium |
| **Mobile Apps** | 📱 Future | Medium |
| **Voice/Video** | 🔮 Future | Low |
| **File Sharing** | 🔮 Future | Low |
| **AI Features** | 🔮 Future | Low |

---

## Technical Capabilities

### Performance

| Metric | Current | Target |
|--------|---------|--------|
| **Max Peers** | 8 (functional) | 16 (with optimization) |
| **Message Latency** | 20-100ms | <50ms |
| **Location Update Rate** | Every 10s | Configurable |
| **Bundle Size** | ~470KB | <400KB |
| **Memory Usage** | 50-100MB | <80MB |
| **Offline Support** | Partial | Full (with PWA) |

### Scalability

**Current Architecture**:
- Optimal: 2-4 peers
- Good: 5-8 peers
- Degraded: 8+ peers

**With Bridge Nodes** (future):
- Support 50+ peers
- Hierarchical mesh
- Load distribution
- Redundant connections

### Browser Support

| Browser | Current | With PWA |
|---------|---------|----------|
| **Chrome 90+** | ✅ Full | ✅ Full |
| **Firefox 88+** | ✅ Full | ✅ Full |
| **Safari 15+** | ✅ Full | ⚠️ Limited PWA |
| **Edge 90+** | ✅ Full | ✅ Full |
| **Mobile Chrome** | ✅ Good | ✅ Excellent |
| **Mobile Safari** | ✅ Good | ⚠️ Limited PWA |

---

## Roadmap

### 2024 Q4 (Prototype)
- ✅ Core P2P communication
- ✅ Location sharing
- ✅ Text chat
- ✅ CRDT synchronization
- ✅ Docker deployment

### 2025 Q1 (Offline-First)
- 🔄 PWA implementation
- 🔄 Local database (SQLite)
- 🔄 Offline map tiles
- 🔄 Service workers
- 🔄 Background sync

### 2025 Q2 (Emergency Features)
- 🔄 SOS button
- 🔄 Check-in system
- 🔄 Dark mode
- 🔄 Push notifications

### 2025 Q3 (Collaboration)
- 🔄 Task assignment
- 🔄 QR discovery
- 🔄 Enhanced UI
- 🔄 Mobile optimization

### 2025 Q4 (Mobile)
- 📱 React Native apps
- 📱 Native features
- 📱 App store release

### 2026+ (Advanced)
- 🔮 Voice/video
- 🔮 File sharing
- 🔮 AI features
- 🔮 Bridge nodes
- 🔮 Advanced security

---

## Feature Requests

Want to suggest a feature?

1. Check if it's already planned above
2. Open a GitHub Issue with:
   - Clear use case
   - Expected behavior
   - Why it benefits disaster response
   - Technical approach (if known)

See [CONTRIBUTING.md](../CONTRIBUTING.md) for more details.

---

## References

- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Project overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [HOW_IT_WORKS.md](./HOW_IT_WORKS.md) - How it works
- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) - Detailed implementation plan for Phase 1 & 2
