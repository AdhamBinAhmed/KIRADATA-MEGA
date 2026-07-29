'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions';
import { useTransition } from 'react';

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useActionState(async (state: string | null, formData: FormData) => {
    const res = await login(formData);
    if (res?.error) {
      return res.error;
    }
    return null;
  }, null);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem' }}>
      <div className="glass-panel" style={{ maxWidth: '400px', width: '100%' }}>
        <h1 className="text-center mb-8">Kira Database</h1>
        
        {error && <div className="error-msg">{error}</div>}
        
        <form action={(formData) => startTransition(() => setError(formData))}>
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              className="input" 
              placeholder="Enter your name" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Primary Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              className="input" 
              placeholder="Enter primary password" 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn" 
            style={{ width: '100%' }}
            disabled={isPending}
          >
            {isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
