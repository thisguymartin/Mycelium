# SwarmTech Architecture Diagrams

## System Overview

```mermaid
graph TB
    subgraph "Client A (Browser)"
        A1[React App]
        A2[Yjs CRDT]
        A3[WebRTC P2P]
        A4[Map + Chat UI]
        A1 --> A2
        A2 --> A3
        A1 --> A4
    end

    subgraph "Client B (Browser)"
        B1[React App]
        B2[Yjs CRDT]
        B3[WebRTC P2P]
        B4[Map + Chat UI]
        B1 --> B2
        B2 --> B3
        B1 --> B4
    end

    subgraph "Server Infrastructure"
        S1[Signaling Server<br/>Node.js + Socket.IO]
        S2[PostgreSQL<br/>Optional]
        S1 -.-> S2
    end

    A3 <-->|WebRTC Data Channel<br/>Direct P2P| B3
    A1 -->|WebSocket<br/>Initial Only| S1
    B1 -->|WebSocket<br/>Initial Only| S1

    style A3 fill:#4ECDC4
    style B3 fill:#4ECDC4
    style S1 fill:#FF6B6B
```

## Connection Flow

```mermaid
sequenceDiagram
    participant A as Client A
    participant S as Signaling Server
    participant B as Client B

    Note over A,B: 1. Initial Connection
    A->>S: Connect via WebSocket
    B->>S: Connect via WebSocket

    Note over A,B: 2. Join Room
    A->>S: Join room "disaster-1"
    B->>S: Join room "disaster-1"
    S->>A: Room peers: [B]
    S->>B: Peer joined: A

    Note over A,B: 3. WebRTC Handshake
    A->>S: Offer (SDP)
    S->>B: Forward offer
    B->>S: Answer (SDP)
    S->>A: Forward answer
    A->>S: ICE candidates
    S->>B: Forward ICE
    B->>S: ICE candidates
    S->>A: Forward ICE

    Note over A,B: 4. Direct P2P Connection
    A<-->B: WebRTC Data Channel<br/>(Direct Connection)

    Note over A,B: 5. Data Synchronization
    A->>B: Yjs update (location)
    B->>A: Yjs update (message)
    A->>B: Yjs update (location)

    Note over A,B: Signaling server no longer needed!
```

## Data Synchronization

```mermaid
graph LR
    subgraph "Agent A State"
        A1[Location: 37.7, -122.4]
        A2[Messages: Array]
        A3[Agents: Map]
    end

    subgraph "CRDT Layer"
        C1[Yjs Document]
        C2[Y.Map locations]
        C3[Y.Array messages]
        C4[Y.Map agents]
    end

    subgraph "Agent B State"
        B1[Location: 37.8, -122.3]
        B2[Messages: Array]
        B3[Agents: Map]
    end

    A1 --> C2
    A2 --> C3
    A3 --> C4

    C2 -->|Sync via WebRTC| B1
    C3 -->|Sync via WebRTC| B2
    C4 -->|Sync via WebRTC| B3

    B1 --> C2
    B2 --> C3
    B3 --> C4

    style C1 fill:#45B7D1
    style C2 fill:#45B7D1
    style C3 fill:#45B7D1
    style C4 fill:#45B7D1
```

## Mesh Network Topology

```mermaid
graph TB
    subgraph "Room: disaster-response-1"
        A[Field Agent A]
        B[Field Agent B]
        C[Command Center]
        D[Volunteer]
    end

    A <-->|WebRTC| B
    A <-->|WebRTC| C
    A <-->|WebRTC| D
    B <-->|WebRTC| C
    B <-->|WebRTC| D
    C <-->|WebRTC| D

    style A fill:#4ECDC4
    style B fill:#4ECDC4
    style C fill:#FF6B6B
    style D fill:#52B788

    Note[Each peer connects to all others<br/>N peers = N×(N-1) connections<br/>Best for 2-5 participants]
```

## Component Architecture

```mermaid
graph TB
    subgraph "Frontend Components"
        UI[App.tsx]
        Map[Map Component]
        Chat[Chat Component]
        Sidebar[Sidebar Component]
        Join[JoinRoom Component]
    end

    subgraph "Services Layer"
        CRDT[CRDT Service]
        WebRTC[WebRTC Service]
        Store[Zustand Store]
    end

    subgraph "Data Layer"
        YDoc[Yjs Document]
        YMap[Y.Map: locations, agents]
        YArray[Y.Array: messages]
    end

    UI --> Map
    UI --> Chat
    UI --> Sidebar
    UI --> Join

    Map --> Store
    Chat --> Store
    Sidebar --> Store

    Store --> CRDT
    CRDT --> WebRTC
    CRDT --> YDoc

    YDoc --> YMap
    YDoc --> YArray

    WebRTC -->|Broadcast Updates| YDoc
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Docker Compose"
        subgraph "Container: swarmtech-client"
            C1[Nginx]
            C2[React Build]
            C1 --> C2
        end

        subgraph "Container: swarmtech-server"
            S1[Node.js]
            S2[Express + Socket.IO]
            S1 --> S2
        end

        subgraph "Container: swarmtech-db"
            D1[PostgreSQL]
        end

        S2 --> D1
    end

    subgraph "Clients"
        Browser1[Browser 1]
        Browser2[Browser 2]
        Mobile[Mobile Browser]
    end

    Browser1 -->|HTTP :5173| C1
    Browser2 -->|HTTP :5173| C1
    Mobile -->|HTTP :5173| C1

    Browser1 -->|WebSocket :8001| S2
    Browser2 -->|WebSocket :8001| S2
    Mobile -->|WebSocket :8001| S2

    Browser1 <-.->|WebRTC P2P| Browser2
    Browser1 <-.->|WebRTC P2P| Mobile
    Browser2 <-.->|WebRTC P2P| Mobile
```

## State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Disconnected
    Disconnected --> Connecting: User joins room
    Connecting --> Connected: WebSocket established
    Connected --> PeerDiscovery: Receive room peers
    PeerDiscovery --> WebRTCHandshake: For each peer
    WebRTCHandshake --> P2PConnected: WebRTC established
    P2PConnected --> Synchronized: CRDT sync complete
    Synchronized --> Synchronized: Location/message updates
    Synchronized --> P2PConnected: Peer leaves
    P2PConnected --> Disconnected: All peers leave
    Connected --> Disconnected: Server disconnects
```

## Technology Stack

```mermaid
graph LR
    subgraph "Frontend Stack"
        F1[React 18]
        F2[TypeScript 5]
        F3[Vite 5]
        F4[Tailwind CSS]
        F5[Leaflet.js]
        F6[Zustand]
    end

    subgraph "Backend Stack"
        B1[Node.js 20]
        B2[Express]
        B3[Socket.IO]
        B4[PostgreSQL 16]
    end

    subgraph "Core Technologies"
        C1[WebRTC]
        C2[Yjs CRDT]
        C3[GeoJSON]
    end

    F1 --> C1
    F1 --> C2
    F5 --> C3
    B3 --> C1
```

---

## Legend

- **Solid lines**: Active connections
- **Dashed lines**: Optional or conditional
- **Blue**: Client/Frontend components
- **Red**: Server/Backend components
- **Green**: Data/State components
