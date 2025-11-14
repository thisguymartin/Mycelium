import { io, Socket } from 'socket.io-client';
import * as Y from 'yjs';
import { Agent } from '@swarmtech/common';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export class WebRTCService {
  private socket: Socket | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private currentAgent: Agent | null = null;
  private ydoc: Y.Doc;
  private onPeerDataCallback?: (peerId: string, data: Uint8Array) => void;

  constructor(ydoc: Y.Doc) {
    this.ydoc = ydoc;
  }

  connect(serverUrl: string, agent: Agent, roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.currentAgent = agent;

      this.socket = io(serverUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('Connected to signaling server');
        this.socket!.emit('join-room', { roomId, agent });
      });

      this.socket.on('room-peers', ({ peers }: { roomId: string; peers: Agent[] }) => {
        console.log(`Room has ${peers.length} existing peers`);
        // Create connections to all existing peers
        peers.forEach((peer) => {
          this.createPeerConnection(peer, true);
        });
        resolve();
      });

      this.socket.on('peer-joined', ({ peer }: { roomId: string; peer: Agent }) => {
        console.log(`Peer joined: ${peer.name}`);
        // Wait for the new peer to create the offer
        // We'll respond to their offer
      });

      this.socket.on('offer', async ({ sdp, from }: { sdp: string; from: string }) => {
        console.log(`Received offer from ${from}`);
        const peerAgent = { id: from, name: 'Peer', role: 'field' } as Agent;
        const peerConnection = this.getPeerConnection(from) || this.createPeerConnection(peerAgent, false);

        await peerConnection.setRemoteDescription({ type: 'offer', sdp });
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        this.socket!.emit('answer', { sdp: answer.sdp, to: from });
      });

      this.socket.on('answer', async ({ sdp, from }: { sdp: string; from: string }) => {
        console.log(`Received answer from ${from}`);
        const peerConnection = this.getPeerConnection(from);
        if (peerConnection) {
          await peerConnection.setRemoteDescription({ type: 'answer', sdp });
        }
      });

      this.socket.on('ice-candidate', async ({ candidate, from }: { candidate: RTCIceCandidateInit; from: string }) => {
        console.log(`Received ICE candidate from ${from}`);
        const peerConnection = this.getPeerConnection(from);
        if (peerConnection && candidate) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });

      this.socket.on('peer-left', ({ peerId }: { roomId: string; peerId: string }) => {
        console.log(`Peer left: ${peerId}`);
        this.closePeerConnection(peerId);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from signaling server');
      });
    });
  }

  private createPeerConnection(peer: Agent, initiator: boolean): RTCPeerConnection {
    console.log(`Creating peer connection to ${peer.name} (initiator: ${initiator})`);

    const peerConnection = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
    });

    this.peerConnections.set(peer.id, peerConnection);

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('ice-candidate', {
          candidate: event.candidate.toJSON(),
          to: peer.id,
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${peer.name}: ${peerConnection.connectionState}`);
      if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
        this.closePeerConnection(peer.id);
      }
    };

    // If we're the initiator, create data channel
    if (initiator) {
      const dataChannel = peerConnection.createDataChannel('swarmtech', {
        ordered: true,
      });
      this.setupDataChannel(peer.id, dataChannel);

      // Create and send offer
      peerConnection.createOffer().then(async (offer) => {
        await peerConnection.setLocalDescription(offer);
        this.socket!.emit('offer', { sdp: offer.sdp, to: peer.id });
      });
    } else {
      // Wait for data channel from initiator
      peerConnection.ondatachannel = (event) => {
        this.setupDataChannel(peer.id, event.channel);
      };
    }

    return peerConnection;
  }

  private setupDataChannel(peerId: string, dataChannel: RTCDataChannel) {
    this.dataChannels.set(peerId, dataChannel);

    dataChannel.onopen = () => {
      console.log(`Data channel opened with peer ${peerId}`);
      // Send current Yjs state to new peer
      const state = Y.encodeStateAsUpdate(this.ydoc);
      this.sendToPeer(peerId, state);
    };

    dataChannel.onmessage = (event) => {
      // Receive Yjs updates from peer
      const update = new Uint8Array(event.data);
      Y.applyUpdate(this.ydoc, update);

      if (this.onPeerDataCallback) {
        this.onPeerDataCallback(peerId, update);
      }
    };

    dataChannel.onclose = () => {
      console.log(`Data channel closed with peer ${peerId}`);
      this.dataChannels.delete(peerId);
    };

    dataChannel.onerror = (error) => {
      console.error(`Data channel error with peer ${peerId}:`, error);
    };
  }

  sendToPeer(peerId: string, data: Uint8Array) {
    const channel = this.dataChannels.get(peerId);
    if (channel && channel.readyState === 'open') {
      channel.send(data);
    }
  }

  broadcast(data: Uint8Array) {
    this.dataChannels.forEach((channel, peerId) => {
      if (channel.readyState === 'open') {
        try {
          channel.send(data);
        } catch (error) {
          console.error(`Failed to send to peer ${peerId}:`, error);
        }
      }
    });
  }

  onPeerData(callback: (peerId: string, data: Uint8Array) => void) {
    this.onPeerDataCallback = callback;
  }

  private getPeerConnection(peerId: string): RTCPeerConnection | undefined {
    return this.peerConnections.get(peerId);
  }

  private closePeerConnection(peerId: string) {
    const connection = this.peerConnections.get(peerId);
    if (connection) {
      connection.close();
      this.peerConnections.delete(peerId);
    }

    const channel = this.dataChannels.get(peerId);
    if (channel) {
      channel.close();
      this.dataChannels.delete(peerId);
    }
  }

  disconnect() {
    // Close all peer connections
    this.peerConnections.forEach((connection) => connection.close());
    this.peerConnections.clear();
    this.dataChannels.clear();

    // Disconnect from signaling server
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getConnectedPeers(): string[] {
    const connected: string[] = [];
    this.dataChannels.forEach((channel, peerId) => {
      if (channel.readyState === 'open') {
        connected.push(peerId);
      }
    });
    return connected;
  }
}
