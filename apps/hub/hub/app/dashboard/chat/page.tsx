'use client';

import { ChatInterface } from '@/components/chat/chat-interface';

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-8rem)] -m-4 sm:-m-6 lg:-m-8">
      <ChatInterface />
    </div>
  );
}

