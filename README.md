# SwarmTech 🚨

**Decentralized Peer-to-Peer Coordination Platform for Disaster Response Teams**

SwarmTech enables real-time coordination for disaster response teams using WebRTC for direct peer-to-peer communication and CRDTs for conflict-free data synchronization. No central server required for communication once connected!

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)

## Features

### Core Capabilities
- **Decentralized P2P Communication**: WebRTC data channels for direct peer-to-peer messaging
- **Real-time Location Tracking**: GeoJSON-based location sharing on interactive maps
- **CRDT Synchronization**: Yjs-powered conflict-free state replication across all peers
- **Text Chat**: Synchronized messaging with automatic conflict resolution
- **Map Visualization**: Leaflet.js maps showing all field agent locations in real-time
- **Offline Resilient**: Data persists locally and syncs when connection restored

### Technical Highlights
- **Mesh Networking**: Each client can connect to multiple peers (optimal for 2-4 participants)
- **Minimal Infrastructure**: Signaling server only needed for initial connection
- **End-to-End Encrypted**: Built-in WebRTC DTLS encryption
- **Role-Based Agents**: Support for field agents, command centers, volunteers, and emergency services
- **Zero Configuration**: Works out of the box with sensible defaults

## Who Is This For?

- **Disaster Response Teams**: Grassroots volunteers coordinating rescue efforts
- **Emergency Services**: Police, Fire, National Guard coordinating operations
- **Event Organizers**: Large-scale event coordination with distributed teams
- **Research**: Academic studies on decentralized coordination systems
- **Developers**: Building decentralized collaboration tools

## Quick Start

### Option 1: Docker (Recommended)

The easiest way to get started is with Docker:

```bash
# Clone the repository
git clone https://github.com/yourusername/swarmtech.git
cd swarmtech

# Start all services
docker-compose up

# Access the application
# Client: http://localhost:5173
# Server: http://localhost:8001
```

### Option 2: Manual Setup

Requirements:
- Node.js 20+ and npm 10+

```bash
# Clone the repository
git clone https://github.com/yourusername/swarmtech.git
cd swarmtech

# Install dependencies
npm install

# Start development servers
npm run dev

# This will start:
# - Signaling server on http://localhost:8001
# - Client on http://localhost:5173
```

## Usage

### Joining a Coordination Room

1. Open http://localhost:5173 in your browser
2. Enter your name
3. Select your role (Field Agent, Command Center, etc.)
4. Enter a Room ID (use the same ID to coordinate with your team)
5. Click "Join Coordination Network"

### Using the Application

Once connected:

- **Map View**: See all team members' locations in real-time
- **Chat**: Click the Chat tab to send messages to your team
- **Agents**: View all active agents and their status
- **Location**: Your location updates automatically (or uses demo location)

### Testing with Multiple Users

Open multiple browser windows (or use different devices) and join the same Room ID. You'll see:
- Each user appears on the map with a colored pin
- Messages sync across all users instantly
- Location updates propagate in real-time
- Works even if some users disconnect and reconnect

## Architecture

```
┌──────────────┐         ┌──────────────┐
│  Browser A   │◄───────►│  Browser B   │
│   (Client)   │  WebRTC │   (Client)   │
└──────┬───────┘  P2P    └───────┬──────┘
       │                         │
       │  WebSocket (Initial)    │
       └────────┬────────────────┘
                │
        ┌───────▼────────┐
        │   Signaling    │
        │     Server     │
        │  (Node.js +    │
        │   Socket.IO)   │
        └────────────────┘
```

**Key Points**:
1. Clients connect to signaling server via WebSocket
2. Server facilitates WebRTC handshake (SDP offer/answer, ICE candidates)
3. Once WebRTC connection established, peers communicate directly
4. Signaling server no longer needed for data transfer
5. All state (locations, messages) synchronized via Yjs CRDT

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Project Structure

```
swarmtech/
├── client/              # React + Vite web application
│   ├── src/
│   │   ├── components/  # React components (Map, Chat, Sidebar, etc.)
│   │   ├── services/    # WebRTC and CRDT services
│   │   ├── store.ts     # Zustand state management
│   │   └── App.tsx      # Main application
│   ├── Dockerfile       # Client production build
│   └── package.json
├── server/              # Node.js signaling server
│   ├── src/
│   │   └── index.ts     # WebSocket signaling server
│   ├── Dockerfile       # Server production build
│   └── package.json
├── common/              # Shared types and utilities
│   ├── src/
│   │   ├── types.ts     # TypeScript types
│   │   └── utils.ts     # Utility functions
│   └── package.json
├── docker-compose.yml   # Docker orchestration
├── ARCHITECTURE.md      # Architecture documentation
└── README.md           # This file
```

## Development

### Running in Development Mode

```bash
# Install dependencies for all workspaces
npm install

# Start both client and server in development mode
npm run dev

# Or start them individually:
npm run dev:client  # Client only (Vite dev server)
npm run dev:server  # Server only (tsx watch mode)
```

### Environment Variables

**Server** (server/.env):
```env
PORT=8001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://swarmtech:swarmtech@localhost:5432/swarmtech
```

**Client** (client/.env):
```env
VITE_SIGNALING_SERVER=http://localhost:8001
```

### Building for Production

```bash
# Build all packages
npm run build

# Build individually
npm run build:client
npm run build:server

# Start production server
npm start
```

## Docker Deployment

### Development

```bash
docker-compose up
```

### Production

```bash
# Build images
docker-compose build

# Start services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Yjs** - CRDT library
- **Leaflet.js** - Map visualization
- **Socket.IO Client** - WebSocket signaling
- **Zustand** - State management
- **Tailwind CSS** - Styling

### Backend
- **Node.js 20** - Runtime
- **Express** - Web framework
- **Socket.IO** - WebSocket server
- **PostgreSQL 16** - Optional database
- **Docker** - Containerization

### Common
- **WebRTC** - Peer-to-peer communication
- **CRDT (Yjs)** - Conflict-free replication
- **GeoJSON** - Location data format

## Configuration

### WebRTC STUN Servers

Default STUN servers (Google public STUN):
```typescript
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];
```

For production, consider using your own TURN servers for better connectivity.

### Location Tracking

The app requests browser geolocation permission. If denied or unavailable, it falls back to a demo location (San Francisco).

To customize the default location, edit `client/src/App.tsx`:
```typescript
const baseLat = 37.7749; // Your latitude
const baseLng = -122.4194; // Your longitude
```

## Troubleshooting

### WebRTC Connection Fails

- Check that both peers can reach the signaling server
- Verify firewall allows UDP traffic for WebRTC
- Try using a TURN server for NAT traversal
- Check browser console for errors

### Location Not Updating

- Grant location permission in browser settings
- For HTTPS deployment, ensure valid SSL certificate
- Check browser console for geolocation errors

### Chat Messages Not Syncing

- Verify WebRTC connection established (check console logs)
- Ensure both peers joined the same Room ID
- Check that data channels are open (connection state: "connected")

### Docker Issues

```bash
# Rebuild containers
docker-compose build --no-cache

# Reset volumes
docker-compose down -v
docker-compose up
```

## Scaling Considerations

### Mesh Network Limits
- **2-3 peers**: Excellent performance
- **4-5 peers**: Good performance
- **6-8 peers**: Degraded but functional
- **8+ peers**: Consider splitting into sub-teams

Each peer maintains N-1 connections (where N = number of peers).

### Team Partitioning

For large operations:
1. Create multiple room IDs (e.g., "team-alpha", "team-bravo")
2. Use command center agents to monitor multiple rooms
3. Implement bridge nodes to relay between teams (future enhancement)

## Security

- **WebRTC Encryption**: All P2P data encrypted via DTLS
- **Transport Security**: Use HTTPS in production
- **Room Access**: Implement access tokens for sensitive operations
- **Input Validation**: All user inputs sanitized

**Note**: This is a demo/prototype. For production use, implement:
- User authentication
- Room access control
- Message signing
- Public key infrastructure

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code follows existing style
- All tests pass
- Documentation updated
- Commit messages are clear

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Voice/video communication
- [ ] File sharing (IPFS integration)
- [ ] Advanced CRDT data types
- [ ] Bridge nodes for multi-team coordination
- [ ] Offline-first progressive web app
- [ ] E2E encryption with public key infrastructure
- [ ] AI-powered situation analysis

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **WebRTC**: Real-time communication foundation
- **Yjs**: Excellent CRDT library
- **Leaflet**: Beautiful open-source maps
- **Socket.IO**: Reliable WebSocket abstraction

## Support

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/yourusername/swarmtech/issues)
- **Documentation**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- **Community**: Join discussions in GitHub Discussions

## Citation

If you use SwarmTech in your research, please cite:

```bibtex
@software{swarmtech2025,
  title = {SwarmTech: Decentralized Disaster Response Coordination},
  year = {2025},
  author = {SwarmTech Contributors},
  url = {https://github.com/yourusername/swarmtech}
}
```

---

Built with ❤️ for disaster response teams worldwide.
