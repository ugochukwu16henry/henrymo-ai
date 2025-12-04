// src/app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getCurrentUser, logout } from '@/lib/auth';
import Chat from '@/components/chat/Chat';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await getCurrentUser();
      setUser(u);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <main className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span>{user?.name}</span>
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="flex-1 p-4 overflow-auto">
        <Chat />
      </section>
    </main>
  );
}
