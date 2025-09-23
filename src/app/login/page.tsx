'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
// import type { AuthSession } from '@/types/auth.types';

export default function LoginPage() {
  const [email, setEmail] = useState('russell@mileaestatevineyard.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useSupabase();

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/review');
      }
    };
    checkAuth();
  }, [router, supabase.auth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      // Navigate to review after successful login
      router.replace('/review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="container">
        <form onSubmit={handleLogin} className="card stack" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="stack text-center">
                <h1>📚 Russell&apos;s Notes</h1>
            <p className="text-muted">Login to review your notes</p>
          </div>
          
          {error && (
            <div className="alert alert--danger">
              {error}
            </div>
          )}
          
          <div className="stack">
            <div className="field">
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </div>
            
            <div className="field">
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn btn--primary"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
