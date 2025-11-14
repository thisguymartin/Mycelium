import { useState, useEffect, useRef } from 'react';
import { Menu, MapPin, Radio } from 'lucide-react';
import { Map } from './components/Map';
import { Sidebar } from './components/Sidebar';
import { JoinRoom } from './components/JoinRoom';
import { useStore } from './store';
import { CRDTService } from './services/crdt';
import { generateId, generateColor, createLocationFeature } from '@swarmtech/common';
import type { Agent, ChatMessage } from '@swarmtech/common';

const SIGNALING_SERVER = import.meta.env.VITE_SIGNALING_SERVER || 'http://localhost:8001';

function App() {
  const [hasJoined, setHasJoined] = useState(false);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const crdt = useRef<CRDTService | null>(null);
  const locationWatchId = useRef<number | null>(null);

  const {
    setCurrentAgent,
    setCurrentRoom,
    setIsConnected,
    addPeer,
    removePeer,
    updateLocation,
    addMessage,
    isSidebarOpen,
    toggleSidebar,
    currentAgent,
  } = useStore();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (crdt.current) {
        crdt.current.disconnect();
      }
      if (locationWatchId.current !== null) {
        navigator.geolocation.clearWatch(locationWatchId.current);
      }
    };
  }, []);

  const handleJoinRoom = async (name: string, role: string, roomId: string) => {
    try {
      const agent: Agent = {
        id: generateId(),
        name,
        role: role as any,
        joinedAt: Date.now(),
        color: generateColor(),
      };

      // Initialize CRDT service
      crdt.current = new CRDTService();

      // Set up observers before connecting
      crdt.current.onAgentsChange((agents) => {
        agents.forEach((peer) => {
          if (peer.id !== agent.id) {
            addPeer(peer);
          }
        });
      });

      crdt.current.onLocationsChange((locations) => {
        locations.forEach((location, agentId) => {
          updateLocation(agentId, location);
        });
      });

      crdt.current.onMessagesChange((messages) => {
        // Update messages in store
        const currentMessages = useStore.getState().messages;
        if (messages.length > currentMessages.length) {
          const newMessages = messages.slice(currentMessages.length);
          newMessages.forEach((msg) => addMessage(msg));
        }
      });

      // Connect to signaling server and join room
      await crdt.current.connect(SIGNALING_SERVER, agent, roomId);

      setCurrentAgent(agent);
      setCurrentRoom({ id: roomId, name: roomId, createdAt: Date.now(), createdBy: agent.id });
      setIsConnected(true);
      setHasJoined(true);

      // Add system message
      const welcomeMessage: ChatMessage = {
        id: generateId(),
        agentId: agent.id,
        agentName: 'System',
        content: `${name} joined the room`,
        timestamp: Date.now(),
        type: 'system',
      };
      crdt.current.addMessage(welcomeMessage);

      // Start location tracking
      startLocationTracking(agent.id);
    } catch (error) {
      console.error('Failed to join room:', error);
      alert('Failed to join room. Please check your connection and try again.');
    }
  };

  const startLocationTracking = (agentId: string) => {
    if ('geolocation' in navigator) {
      setIsTrackingLocation(true);

      // Get initial location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateAgentLocation(agentId, position);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use a default location for demo purposes
          useDemoLocation(agentId);
        }
      );

      // Watch for location changes
      locationWatchId.current = navigator.geolocation.watchPosition(
        (position) => {
          updateAgentLocation(agentId, position);
        },
        (error) => {
          console.error('Error watching location:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000,
        }
      );
    } else {
      console.warn('Geolocation not supported, using demo location');
      useDemoLocation(agentId);
    }
  };

  const updateAgentLocation = (agentId: string, position: GeolocationPosition) => {
    const location = createLocationFeature(
      agentId,
      position.coords.longitude,
      position.coords.latitude,
      {
        accuracy: position.coords.accuracy,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        altitude: position.coords.altitude || undefined,
      }
    );

    if (crdt.current) {
      crdt.current.updateLocation(agentId, location);
    }
    updateLocation(agentId, location);
  };

  const useDemoLocation = (agentId: string) => {
    // San Francisco demo location with small random offset
    const baseLat = 37.7749 + (Math.random() - 0.5) * 0.01;
    const baseLng = -122.4194 + (Math.random() - 0.5) * 0.01;

    const location = createLocationFeature(agentId, baseLng, baseLat, {
      accuracy: 10,
    });

    if (crdt.current) {
      crdt.current.updateLocation(agentId, location);
    }
    updateLocation(agentId, location);
    setIsTrackingLocation(true);
  };

  const handleSendMessage = (content: string) => {
    if (!crdt.current || !currentAgent) return;

    const message: ChatMessage = {
      id: generateId(),
      agentId: currentAgent.id,
      agentName: currentAgent.name,
      content,
      timestamp: Date.now(),
      type: 'text',
    };

    crdt.current.addMessage(message);
    addMessage(message);
  };

  if (!hasJoined) {
    return <JoinRoom onJoin={handleJoinRoom} />;
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Map */}
      <Map />

      {/* Sidebar */}
      <Sidebar onSendMessage={handleSendMessage} />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700 p-4 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="text-primary" size={24} />
            <div>
              <h1 className="text-white font-bold text-lg">SwarmTech</h1>
              <p className="text-gray-400 text-xs">Disaster Response Coordination</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isTrackingLocation && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <MapPin size={16} className="animate-pulse" />
                <span>Location Active</span>
              </div>
            )}

            {!isSidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Menu size={24} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
