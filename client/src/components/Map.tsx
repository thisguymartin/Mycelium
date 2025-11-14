import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '../store';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarkers() {
  const locations = useStore((state) => state.locations);
  const peers = useStore((state) => state.peers);
  const currentAgent = useStore((state) => state.currentAgent);

  return (
    <>
      {Array.from(locations.entries()).map(([agentId, location]) => {
        const agent = peers.get(agentId) || (currentAgent?.id === agentId ? currentAgent : null);
        if (!agent) return null;

        const [lng, lat] = location.geometry.coordinates;

        // Create custom icon with agent color
        const icon = L.divIcon({
          html: `<div style="background-color: ${agent.color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          className: 'custom-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        return (
          <Marker key={agentId} position={[lat, lng]} icon={icon}>
            <Popup>
              <div className="text-sm">
                <strong>{agent.name}</strong>
                <br />
                Role: {agent.role}
                <br />
                Time: {new Date(location.properties.timestamp).toLocaleTimeString()}
                {location.properties.accuracy && (
                  <>
                    <br />
                    Accuracy: ±{Math.round(location.properties.accuracy)}m
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

function MapUpdater() {
  const map = useMap();
  const locations = useStore((state) => state.locations);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && locations.size > 0) {
      // Center map on first location
      const firstLocation = Array.from(locations.values())[0];
      const [lng, lat] = firstLocation.geometry.coordinates;
      map.setView([lat, lng], 13);
      hasInitialized.current = true;
    }
  }, [locations, map]);

  return null;
}

export function Map() {
  // Default center (can be overridden by user location)
  const defaultCenter: [number, number] = [37.7749, -122.4194]; // San Francisco

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarkers />
        <MapUpdater />
      </MapContainer>
    </div>
  );
}
