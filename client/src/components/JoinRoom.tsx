import { useState } from 'react';
import { Radio, Shield, Users, Globe } from 'lucide-react';
import { generateColor } from '@swarmtech/common';

interface JoinRoomProps {
  onJoin: (name: string, role: string, roomId: string) => void;
}

export function JoinRoom({ onJoin }: JoinRoomProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('field');
  const [roomId, setRoomId] = useState('disaster-response-1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && roomId.trim()) {
      onJoin(name.trim(), role, roomId.trim());
    }
  };

  const roles = [
    { id: 'field', label: 'Field Agent', icon: Radio, description: 'On-ground response' },
    { id: 'command', label: 'Command Center', icon: Shield, description: 'Coordination & oversight' },
    { id: 'volunteer', label: 'Volunteer', icon: Users, description: 'Grassroots support' },
    { id: 'police', label: 'Police', icon: Shield, description: 'Law enforcement' },
    { id: 'fire', label: 'Fire Service', icon: Globe, description: 'Fire & rescue' },
    { id: 'national-guard', label: 'National Guard', icon: Shield, description: 'Military support' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-primary rounded-full mb-4">
            <Radio size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SwarmTech</h1>
          <p className="text-gray-400">
            Decentralized Disaster Response Coordination
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-2xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === r.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <r.icon size={24} className="mx-auto mb-2" />
                  <div className="text-sm font-medium">{r.label}</div>
                  <div className="text-xs mt-1 opacity-70">{r.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Room ID
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="disaster-response-1"
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
              pattern="[a-zA-Z0-9-_]{3,50}"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use the same Room ID to coordinate with your team
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80 transition-colors"
          >
            Join Coordination Network
          </button>
        </form>

        {/* Info */}
        <div className="mt-8 bg-gray-800/50 rounded-lg p-6 text-gray-400 text-sm">
          <h3 className="text-white font-semibold mb-2">How it works:</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Everyone in the same room connects peer-to-peer via WebRTC</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Your location and messages sync automatically with all team members</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>No central server required - fully decentralized coordination</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Works on mesh networks and in low-connectivity scenarios</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
