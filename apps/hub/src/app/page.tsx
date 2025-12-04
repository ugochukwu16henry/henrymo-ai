// src/app/page.tsx
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to HenryMo AI</h1>
      {user ? (
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </Link>
      ) : (
        <>
          <Link
            href="/login"
            className="px-6 py-3 bg-green-600 text-white rounded mr-4 hover:bg-green-700 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Register
          </Link>
        </>
      )}
    </main>
  );
}
