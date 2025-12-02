import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to login for now (dashboard will be in Day 8)
  redirect('/login');
}

