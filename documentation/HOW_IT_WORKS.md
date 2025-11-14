# How Mycelium Works

This document explains in detail how Mycelium functions, from connection establishment to real-time synchronization.

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Connection Lifecycle](#connection-lifecycle)
3. [State Synchronization](#state-synchronization)
4. [Location Tracking](#location-tracking)
5. [Message Broadcasting](#message-broadcasting)
6. [Peer Discovery](#peer-discovery)
7. [Error Handling](#error-handling)

---

## High-Level Overview

Mycelium works through a combination of three key technologies working together:

```
┌─────────────────────────────────────────────────────────┐
│                   How Mycelium Works                     │
└─────────────────────────────────────────────────────────┘

1. WebSocket Signaling (Initial Connection)
   ├─ Connect to signaling server
   ├─ Join room and discover peers
   └─ Exchange WebRTC connection info

2. WebRTC P2P (Direct Communication)
   ├─ Establish peer-to-peer connections
   ├─ Create data channels
   └─ Direct data transfer (bypasses server)

3. CRDT Synchronization (Conflict-Free State)
   ├─ Local state changes encoded by Yjs
   ├─ Broadcast updates via WebRTC
   └─ Automatic conflict resolution
```

### The Three Pillars

1. **WebSocket Signaling**: Helps peers find each other (temporary)
2. **WebRTC Data Channels**: Direct encrypted P2P connections (permanent)
3. **Yjs CRDTs**: Automatic conflict-free state synchronization (ongoing)

---

## Connection Lifecycle

### Phase 1: Joining a Room

```
User Action: Enter name, select role, enter Room ID → Click "Join"
    ↓
App.tsx: handleJoinRoom()
    ↓
1. Create Agent object
   {
     id: "agent-1234567890-abc",
     name: "John Doe",
     role: "field",
     joinedAt: 1699123456789,
     color: "#4ECDC4"
   }
    ↓
2. Initialize CRDT Service
   new CRDTService()
     ├─ Creates Yjs document
     ├─ Sets up Y.Map for agents
     ├─ Sets up Y.Map for locations
     └─ Sets up Y.Array for messages
    ↓
3. Set up observers for reactive updates
   crdt.onAgentsChange(callback)
   crdt.onLocationsChange(callback)
   crdt.onMessagesChange(callback)
    ↓
4. Connect to signaling server
   crdt.connect(SIGNALING_SERVER, agent, roomId)
```

### Phase 2: Signaling Server Connection

```
CRDTService.connect() → WebRTCService.connect()
    ↓
Socket.IO Client connects to ws://localhost:8001
    ↓
socket.on('connect'):
    emit('join-room', { roomId: "team-alpha", agent: {...} })
    ↓
Server receives 'join-room'
    ↓
Server Logic:
1. Create room if doesn't exist
2. Add agent to room's peer map
3. Get list of existing peers (excluding new agent)
4. Send existing peers to new agent
    ↓
emit('room-peers', { roomId, peers: [peer1, peer2, ...] })
    ↓
Client receives 'room-peers'
    ↓
For each existing peer:
    createPeerConnection(peer, initiator=true)
```

### Phase 3: WebRTC Connection Establishment

For each peer, the following happens:

```
Client A (Initiator)                      Client B (Responder)
      │                                          │
      ├─ createPeerConnection(peerB, true)      │
      ├─ new RTCPeerConnection()                 │
      ├─ createDataChannel('mycelium')          │
      ├─ createOffer()                           │
      ├─ setLocalDescription(offer)              │
      ├─ emit('offer', { sdp, to: peerB.id })   │
      │                                          │
      │ ─────────────( via signaling )────────► │
      │                                          │
      │                                          ├─ on('offer')
      │                                          ├─ setRemoteDescription(offer)
      │                                          ├─ createAnswer()
      │                                          ├─ setLocalDescription(answer)
      │                                          ├─ emit('answer', { sdp, to: peerA.id })
      │                                          │
      │ ◄─────────────( via signaling )───────── │
      │                                          │
      ├─ on('answer')                            │
      ├─ setRemoteDescription(answer)            │
      │                                          │
      ├── Exchange ICE candidates (both ways) ───┤
      │                                          │
      ├─────────── Direct P2P Connection ────────┤
      │          (data channel opens)            │
      │                                          │
      ├──────────── Yjs State Sync ─────────────►│
      │                                          │
      │◄──────── Bidirectional Updates ─────────►│
```

### Phase 4: State Synchronization

Once the data channel opens:

```
Data Channel: onopen event
    ↓
Send current Yjs state to new peer:
    const state = Y.encodeStateAsUpdate(ydoc)
    dataChannel.send(state)
    ↓
Peer receives state:
    Y.applyUpdate(ydoc, state)
    ↓
Both peers now have synchronized state!
    ↓
Ongoing: Any local changes → Yjs update → broadcast to all peers
```

---

## State Synchronization

### How CRDTs Work in Mycelium

Mycelium uses Yjs CRDTs to ensure all peers eventually have the same state, even with:
- Concurrent edits
- Network delays
- Offline/online transitions
- Out-of-order messages

### Example: Location Update

```
User A moves from [37.7749, -122.4194] to [37.7750, -122.4195]
    ↓
navigator.geolocation.watchPosition() triggers
    ↓
updateAgentLocation(agentId, newPosition)
    ↓
createLocationFeature(agentId, lng, lat, metadata)
    ↓
CRDTService.updateLocation(agentId, locationFeature)
    ↓
yLocations.set(agentId, locationFeature)
    ↓
Yjs detects change → fires 'update' event
    ↓
ydoc.on('update', (update) => {
    webrtc.broadcast(update)  // Send to ALL connected peers
})
    ↓
WebRTCService.broadcast(update)
    ├─ For each open data channel:
    │   dataChannel.send(update)
    │
    ├─ Peer B receives:  dataChannel.onmessage(event)
    ├─ Peer C receives:  dataChannel.onmessage(event)
    └─ Peer D receives:  dataChannel.onmessage(event)
    ↓
Each peer applies update:
    Y.applyUpdate(ydoc, update)
    ↓
Yjs observer fires:
    yLocations.observe(() => {
        callback(this.getLocations())
    })
    ↓
Update Zustand store:
    updateLocation(agentId, location)
    ↓
React re-renders Map component
    ↓
All users see User A's new location!
```

### Conflict Resolution Example

What happens when two users update at the same time?

```
Time T0:
    User A location: [37.7749, -122.4194]
    User B location: [37.7760, -122.4200]

Time T1:
    User A moves → [37.7750, -122.4195]
    User B moves → [37.7761, -122.4201]

Both updates happen simultaneously!

User A's update:
    yLocations.set("agent-a", locationA)
    → broadcast to peers

User B's update:
    yLocations.set("agent-b", locationB)
    → broadcast to peers

Result: NO CONFLICT!
    ├─ Each agent has their own key in the map
    ├─ Yjs ensures both updates apply correctly
    └─ Final state has both locations updated

What if the SAME agent updated from two devices?
    ├─ Last-write-wins based on Lamport timestamps
    ├─ Yjs automatically merges
    └─ Eventually consistent across all peers
```

---

## Location Tracking

### Geolocation Flow

```
App.tsx: startLocationTracking(agentId)
    ↓
Check: 'geolocation' in navigator?
    ├─ YES → Use browser geolocation
    └─ NO  → Use demo location
    ↓
Get Initial Location:
    navigator.geolocation.getCurrentPosition(
        onSuccess,
        onError,
        options
    )
    ↓
Watch for Changes:
    watchId = navigator.geolocation.watchPosition(
        onSuccess,
        onError,
        {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
        }
    )
    ↓
On Position Update:
    position = {
        coords: {
            latitude,
            longitude,
            accuracy,
            heading,
            speed,
            altitude
        },
        timestamp
    }
    ↓
Convert to GeoJSON Feature:
    createLocationFeature(agentId, lng, lat, metadata)
    ↓
Update CRDT:
    crdt.updateLocation(agentId, feature)
    ↓
Broadcast to All Peers (via WebRTC)
```

### GeoJSON Format

Locations are stored as GeoJSON Features:

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749]  // [lng, lat]
  },
  "properties": {
    "agentId": "agent-1234567890-abc",
    "timestamp": 1699123456789,
    "accuracy": 10,
    "heading": 45,
    "speed": 1.5,
    "altitude": 100
  }
}
```

### Demo Location (Fallback)

If geolocation fails or is denied:

```typescript
const baseLat = 37.7749 + (Math.random() - 0.5) * 0.01
const baseLng = -122.4194 + (Math.random() - 0.5) * 0.01

// San Francisco with small random offset
// Each user gets a slightly different demo location
```

---

## Message Broadcasting

### Sending a Message

```
User types: "Help needed at coordinates XYZ"
    ↓
Chat Component: onSendMessage(content)
    ↓
App.tsx: handleSendMessage(content)
    ↓
Create ChatMessage object:
    {
        id: "msg-1234567890-xyz",
        agentId: currentAgent.id,
        agentName: currentAgent.name,
        content: "Help needed at coordinates XYZ",
        timestamp: Date.now(),
        type: "text"
    }
    ↓
Add to CRDT:
    crdt.addMessage(message)
    ↓
Yjs Array Push:
    yMessages.push([message])
    ↓
Yjs fires 'update' event
    ↓
Broadcast via WebRTC to all peers
    ↓
All peers receive update
    ↓
Y.applyUpdate() on each peer
    ↓
Observer fires: yMessages.observe()
    ↓
Update local store: addMessage(message)
    ↓
React re-renders Chat component
    ↓
Message appears in all users' chats!
```

### Message Types

```typescript
type MessageType = 'text' | 'system' | 'emergency'

// Text message (user-generated)
{
    type: 'text',
    content: "We need medical supplies"
}

// System message (auto-generated)
{
    type: 'system',
    content: "John Doe joined the room"
}

// Emergency message (future feature)
{
    type: 'emergency',
    content: "🚨 SOS ALERT from Agent Alpha"
}
```

### Message Ordering

Yjs Y.Array guarantees:
- ✅ Messages appear in the same order for all users
- ✅ Concurrent inserts are handled gracefully
- ✅ No duplicates (idempotent)
- ✅ Eventual consistency

---

## Peer Discovery

### Discovering Existing Peers

When you join a room:

```
1. Connect to signaling server
2. Send join-room request
3. Server responds with list of existing peers
4. Create WebRTC connections to each peer
5. Data channels open
6. Sync state with all peers
```

### Discovering New Peers

When someone joins after you:

```
Server broadcasts to existing peers:
    emit('peer-joined', { roomId, peer: newAgent })
    ↓
Existing peers receive notification
    ↓
They wait for the new peer to initiate WebRTC connection
    ↓
New peer creates offers to all existing peers
    ↓
Existing peers respond with answers
    ↓
All peers now connected in full mesh
```

### Peer Tracking

```typescript
// In-memory on signaling server
rooms = Map<roomId, RoomData>

interface RoomData {
    id: string
    name: string
    peers: Map<agentId, Agent>
    createdAt: number
}

// When peer leaves
- Remove from room.peers
- Notify other peers
- If room empty, delete room
```

---

## Error Handling

### Connection Errors

```typescript
// WebRTC connection fails
peerConnection.onconnectionstatechange = () => {
    if (state === 'failed' || state === 'disconnected') {
        closePeerConnection(peerId)
        // User notified via UI
        // Automatic retry (future feature)
    }
}

// Signaling server connection fails
socket.on('connect_error', (error) => {
    // Show reconnecting indicator
    // Socket.IO automatically retries
})
```

### Geolocation Errors

```typescript
navigator.geolocation.getCurrentPosition(
    onSuccess,
    (error) => {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                // Fall back to demo location
                useDemoLocation(agentId)
                break
            case error.POSITION_UNAVAILABLE:
                // Location info unavailable
                break
            case error.TIMEOUT:
                // Request timeout
                break
        }
    }
)
```

### CRDT Update Errors

CRDTs are designed to handle errors gracefully:

```
✅ Network partition → Updates queue locally
✅ Out-of-order messages → Correct order maintained
✅ Duplicate messages → Idempotent application
✅ Concurrent edits → Automatic merge
✅ Peer disconnect → State persists locally
```

---

## Performance Optimizations

### 1. Binary Encoding
- Yjs uses efficient binary encoding
- ~2x compression compared to JSON
- Minimal network overhead

### 2. Incremental Updates
- Only send changes, not entire state
- Update size typically 100-500 bytes
- Location update: ~200 bytes

### 3. Local-First
- Changes apply locally immediately
- No wait for network round-trip
- Perceived latency: ~0ms

### 4. Efficient Data Structures
```typescript
// Y.Map for sparse data (agents, locations)
// - O(1) lookup
// - Efficient updates

// Y.Array for sequential data (messages)
// - Maintains order
// - Efficient append
```

### 5. Connection Reuse
- WebRTC connections persist
- No per-message overhead
- Data channels remain open

---

## What Happens When...

### A user goes offline?

```
1. WebRTC connections timeout
2. Data channels close
3. Peer removed from active peer list
4. Other users see them as "offline"
5. When they reconnect:
   ├─ Rejoin room
   ├─ Reconnect to peers
   └─ Sync missed updates
```

### Two users edit the same location?

```
This shouldn't happen (each agent owns their location key)

But if it did:
1. Both updates are CRD merges
2. Last-write-wins based on Lamport timestamp
3. All peers converge to same final state
```

### The signaling server crashes?

```
1. Existing P2P connections: ✅ KEEP WORKING
2. New connections: ❌ CANNOT ESTABLISH
3. Existing users: Continue chatting and sharing locations
4. New users: Cannot join until server restarts

This is why it's "hybrid" P2P!
```

### Network latency is high?

```
1. Local updates still instant (local-first)
2. Remote updates delayed but eventual
3. CRDT guarantees eventual consistency
4. UI can show "syncing" indicator
5. No data loss or corruption
```

---

## Summary

Mycelium works through a carefully orchestrated dance of:

1. **WebSocket Signaling** - Helps peers find each other
2. **WebRTC Data Channels** - Direct encrypted P2P connections
3. **Yjs CRDTs** - Automatic conflict-free state synchronization
4. **React UI** - Real-time reactive interface

The result is a system that:
- ✅ Works with minimal infrastructure
- ✅ Continues operating during network issues
- ✅ Scales well for small teams (2-8 people)
- ✅ Requires zero configuration
- ✅ Provides real-time updates
- ✅ Handles conflicts automatically

For more technical details, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DATA_FLOWS.md](./DATA_FLOWS.md) - Detailed data flow diagrams
- [TECHNICAL_STACK.md](./TECHNICAL_STACK.md) - Technology choices
