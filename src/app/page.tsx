import { getWorkerName, getProducts, getLogs, logout } from '@/app/actions';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function Home() {
  const workerName = await getWorkerName();
  
  if (!workerName) {
    redirect('/login');
  }

  const products = await getProducts();
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
        <DashboardClient initialProducts={products} initialLogs={logs} />
      </main>
    </>
  );
}
