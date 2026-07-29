import { getWorkerName, getLogs, logout } from '@/app/actions';
import { redirect } from 'next/navigation';
import Navbar from '@/app/components/Navbar';

export default async function LogsPage() {
  const workerName = await getWorkerName();
  
  if (!workerName) {
    redirect('/login');
  }

  const logs = await getLogs();

  return (
    <>
      <header className="header">
        <div className="flex items-center gap-2">
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', borderRadius: '8px' }}></div>
          <h2 style={{ marginBottom: 0 }}>Kira DB</h2>
        </div>
        <div className="user-info">
          <span className="worker-name">Logged in as {workerName}</span>
          <form action={logout}>
            <button type="submit" className="action-btn" title="Logout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </form>
        </div>
      </header>

      <main className="container" style={{ marginTop: '2rem' }}>
        <Navbar currentPath="logs" />
        
        <div className="glass-panel" style={{ height: '100%' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ marginBottom: 0 }}>Activity Log</h2>
            <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Last 50 actions</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {logs.length === 0 ? (
              <div className="text-center" style={{ color: '#94a3b8', padding: '2rem 0' }}>No activity logs yet.</div>
            ) : (
              logs.map(log => (
                <div key={log.id} style={{ 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{log.worker_name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {new Date(log.timestamp).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${log.action === 'ADDED' ? 'badge-added' : 'badge-deleted'}`}>
                      {log.action}
                    </span>
                    <span style={{ color: '#cbd5e1' }}>
                      <strong>{log.quantity}</strong> units of <strong style={{ color: '#fff' }}>{log.product_name}</strong> in category <strong>{log.category || 'general'}</strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
