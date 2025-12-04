// src/components/chat/Chat.tsx
'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

type Message = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

export default function Chat() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // 1️⃣ fetch (or create) a default conversation on mount
  useEffect(() => {
    const init = async () => {
      // try to get existing conversations
      const convRes = await api.get('/api/conversations');
      const convo = convRes.data[0];
      if (convo) {
        setConversationId(convo.id);
        const msgs = await api.get(`/api/conversations/${convo.id}/messages`);
        setMessages(msgs.data);
      } else {
        // create a new one
        const createRes = await api.post('/api/conversations', {
          title: 'Demo Conversation',
        });
        const newId = createRes.data.id;
        setConversationId(newId);
      }
    };
    init();
  }, []);

  // 2️⃣ send a new message
  const sendMessage = async () => {
    if (!conversationId || !input.trim()) return;
    setLoading(true);
    try {
      // optimistic UI – add user message immediately
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: input,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // call backend (which also generates AI reply)
      const resp = await api.post(`/api/conversations/${conversationId}/message`, {
        content: input,
      });

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: resp.data.reply,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setInput('');
    } catch (err) {
      console.error(err);
      alert('Message failed');
    } finally {
      setLoading(false);
    }
  };

  // handle Enter key
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === 'assistant' ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.role === 'assistant'
                  ? 'bg-white dark:bg-gray-800'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <p className="text-center">Thinking…</p>}
      </div>

      <div className="mt-4 flex gap-2">
        <textarea
          rows={2}
          className="flex-1 border rounded p-2 resize-none"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
