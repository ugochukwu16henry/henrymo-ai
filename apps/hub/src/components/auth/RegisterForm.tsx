// src/components/auth/RegisterForm.tsx
'use client';
import { useState } from 'react';
import { register } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ email, password, name });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      {error && <p className="text-red-600">{error}</p>}
      <input
        type="text"
        required
        placeholder="Name"
        className="w-full border rounded p-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        required
        placeholder="Email"
        className="w-full border rounded p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        required
        placeholder="Password"
        className="w-full border rounded p-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
      >
        {loading ? 'Registering…' : 'Register'}
      </button>
    </form>
  );
}
