import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useStore } from '../store';
import { ChatMessage } from '@swarmtech/common';
import { generateId, formatTime } from '@swarmtech/common';

interface ChatProps {
  onSendMessage: (content: string) => void;
}

export function Chat({ onSendMessage }: ChatProps) {
  const [input, setInput] = useState('');
  const messages = useStore((state) => state.messages);
  const currentAgent = useStore((state) => state.currentAgent);
  const peers = useStore((state) => state.peers);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && currentAgent) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const getAgentName = (agentId: string): string => {
    if (currentAgent?.id === agentId) return 'You';
    const peer = peers.get(agentId);
    return peer?.name || 'Unknown';
  };

  const getAgentColor = (agentId: string): string => {
    if (currentAgent?.id === agentId) return currentAgent.color;
    const peer = peers.get(agentId);
    return peer?.color || '#gray';
  };

  const getMessageStyle = (message: ChatMessage) => {
    const isOwnMessage = message.agentId === currentAgent?.id;

    if (message.type === 'system') {
      return 'bg-gray-700 text-gray-300 text-center italic';
    }
    if (message.type === 'emergency') {
      return 'bg-red-600 text-white';
    }
    return isOwnMessage ? 'bg-primary text-white ml-auto' : 'bg-gray-700 text-white';
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Send a message to start coordinating!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.agentId === currentAgent?.id;
            const isSystem = message.type === 'system';

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage || isSystem ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getMessageStyle(message)}`}>
                  {!isSystem && (
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getAgentColor(message.agentId) }}
                      />
                      <span className="text-xs font-semibold">
                        {getAgentName(message.agentId)}
                      </span>
                      <span className="text-xs opacity-70">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  )}
                  <p className="text-sm break-words">{message.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
