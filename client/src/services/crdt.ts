import * as Y from 'yjs';
import { Agent, AgentLocation, ChatMessage } from '@swarmtech/common';
import { WebRTCService } from './webrtc';

export class CRDTService {
  public ydoc: Y.Doc;
  private yAgents: Y.Map<Agent>;
  private yLocations: Y.Map<AgentLocation>;
  private yMessages: Y.Array<ChatMessage>;
  private webrtc: WebRTCService;

  constructor() {
    this.ydoc = new Y.Doc();
    this.yAgents = this.ydoc.getMap('agents');
    this.yLocations = this.ydoc.getMap('locations');
    this.yMessages = this.ydoc.getArray('messages');
    this.webrtc = new WebRTCService(this.ydoc);

    // Listen to Yjs updates and broadcast them
    this.ydoc.on('update', (update: Uint8Array) => {
      this.webrtc.broadcast(update);
    });
  }

  async connect(serverUrl: string, agent: Agent, roomId: string) {
    await this.webrtc.connect(serverUrl, agent, roomId);
    // Add ourselves to the agents map
    this.yAgents.set(agent.id, agent);
  }

  disconnect() {
    this.webrtc.disconnect();
  }

  // Agent management
  addAgent(agent: Agent) {
    this.yAgents.set(agent.id, agent);
  }

  removeAgent(agentId: string) {
    this.yAgents.delete(agentId);
    this.yLocations.delete(agentId);
  }

  getAgents(): Map<string, Agent> {
    const agents = new Map<string, Agent>();
    this.yAgents.forEach((agent, id) => {
      agents.set(id, agent);
    });
    return agents;
  }

  onAgentsChange(callback: (agents: Map<string, Agent>) => void) {
    this.yAgents.observe(() => {
      callback(this.getAgents());
    });
  }

  // Location management
  updateLocation(agentId: string, location: AgentLocation) {
    this.yLocations.set(agentId, location);
  }

  getLocations(): Map<string, AgentLocation> {
    const locations = new Map<string, AgentLocation>();
    this.yLocations.forEach((location, id) => {
      locations.set(id, location);
    });
    return locations;
  }

  onLocationsChange(callback: (locations: Map<string, AgentLocation>) => void) {
    this.yLocations.observe(() => {
      callback(this.getLocations());
    });
  }

  // Message management
  addMessage(message: ChatMessage) {
    this.yMessages.push([message]);
  }

  getMessages(): ChatMessage[] {
    return this.yMessages.toArray();
  }

  onMessagesChange(callback: (messages: ChatMessage[]) => void) {
    this.yMessages.observe(() => {
      callback(this.getMessages());
    });
  }

  getWebRTC(): WebRTCService {
    return this.webrtc;
  }
}
