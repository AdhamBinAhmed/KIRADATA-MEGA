'use client';

import Link from 'next/link';

export default function Navbar({ currentPath }: { currentPath: string }) {
  const categories = ['general', 'silicon', 'chipboard', 'marble', 'wood'];

  return (
    <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', overflowX: 'auto', marginBottom: '2rem' }}>
      {categories.map(c => {
        const isActive = currentPath === c;
        return (
          <Link 
            key={c}
            href={`/${c}`}
            className="btn"
            style={{
              textTransform: 'capitalize',
              background: isActive ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.05)',
              color: isActive ? '#fff' : '#cbd5e1',
              borderColor: isActive ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)',
            }}
          >
            {c}
          </Link>
        );
      })}
      
      <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }}></div>

      <Link 
        href="/logs"
        className="btn"
        style={{
          background: currentPath === 'logs' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.05)',
          color: currentPath === 'logs' ? '#fff' : '#cbd5e1',
          borderColor: currentPath === 'logs' ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)',
        }}
      >
        Activity Logs
      </Link>
    </div>
  );
}
