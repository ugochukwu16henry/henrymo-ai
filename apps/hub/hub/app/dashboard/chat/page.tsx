'use client';

import { ChatInterface } from '@/components/chat/chat-interface';

export default function ChatPage() {
  return (
    <div className="fixed inset-0 top-16 left-64 right-0 bottom-0">
      <ChatInterface />
    </div>
  );
}

