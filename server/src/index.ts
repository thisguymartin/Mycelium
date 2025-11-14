import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { Agent, SignalingMessage } from '@swarmtech/common';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// In-memory storage for rooms and peers
interface RoomData {
  id: string;
  name: string;
  peers: Map<string, Agent>;
  createdAt: number;
}

const rooms = new Map<string, RoomData>();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    rooms: rooms.size,
    timestamp: Date.now(),
  });
});

// Get room info
app.get('/rooms/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({
    id: room.id,
    name: room.name,
    peerCount: room.peers.size,
    createdAt: room.createdAt,
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  let currentRoom: string | null = null;
  let currentAgent: Agent | null = null;

  // Join a room
  socket.on('join-room', (data: { roomId: string; agent: Agent }) => {
    const { roomId, agent } = data;

    // Leave current room if any
    if (currentRoom) {
      leaveRoom(socket, currentRoom, agent.id);
    }

    // Create room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        name: roomId,
        peers: new Map(),
        createdAt: Date.now(),
      });
      console.log(`Room created: ${roomId}`);
    }

    const room = rooms.get(roomId)!;
    room.peers.set(agent.id, agent);
    currentRoom = roomId;
    currentAgent = agent;

    // Join socket room
    socket.join(roomId);

    // Send current peers to the new user
    const peers = Array.from(room.peers.values()).filter(p => p.id !== agent.id);
    socket.emit('room-peers', { roomId, peers });

    // Notify others about the new peer
    socket.to(roomId).emit('peer-joined', { roomId, peer: agent });

    console.log(`Agent ${agent.name} joined room ${roomId}. Total peers: ${room.peers.size}`);
  });

  // WebRTC signaling: forward offers
  socket.on('offer', (data: { sdp: string; to: string }) => {
    if (!currentAgent) return;
    socket.to(data.to).emit('offer', {
      sdp: data.sdp,
      from: currentAgent.id,
    });
  });

  // WebRTC signaling: forward answers
  socket.on('answer', (data: { sdp: string; to: string }) => {
    if (!currentAgent) return;
    socket.to(data.to).emit('answer', {
      sdp: data.sdp,
      from: currentAgent.id,
    });
  });

  // WebRTC signaling: forward ICE candidates
  socket.on('ice-candidate', (data: { candidate: RTCIceCandidateInit; to: string }) => {
    if (!currentAgent) return;
    socket.to(data.to).emit('ice-candidate', {
      candidate: data.candidate,
      from: currentAgent.id,
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    if (currentRoom && currentAgent) {
      leaveRoom(socket, currentRoom, currentAgent.id);
    }
  });

  // Explicit leave
  socket.on('leave-room', () => {
    if (currentRoom && currentAgent) {
      leaveRoom(socket, currentRoom, currentAgent.id);
    }
  });
});

function leaveRoom(socket: any, roomId: string, agentId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.peers.delete(agentId);
  socket.leave(roomId);
  socket.to(roomId).emit('peer-left', { roomId, peerId: agentId });

  console.log(`Agent ${agentId} left room ${roomId}. Remaining peers: ${room.peers.size}`);

  // Clean up empty rooms
  if (room.peers.size === 0) {
    rooms.delete(roomId);
    console.log(`Room ${roomId} deleted (empty)`);
  }
}

const PORT = process.env.PORT || 8001;

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║          SwarmTech Signaling Server           ║
╚═══════════════════════════════════════════════╝

Server running on: http://localhost:${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}

Ready to coordinate disaster response teams! 🚨
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
