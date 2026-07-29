'use client';

import { useActionState, useTransition } from 'react';
import { addProduct, updateProductAmount, deleteProduct } from '@/app/actions';

type Product = {
  id: string;
  name: string;
  amount: number;
};

type Log = {
  id: string;
  worker_name: string;
  action: string;
  product_name: string;
  quantity: number;
  timestamp: string;
};

export default function DashboardClient({ 
  initialProducts, 
  initialLogs 
}: { 
  initialProducts: Product[], 
  initialLogs: Log[] 
}) {
  const [isPending, startTransition] = useTransition();
  
  const [addError, addAction] = useActionState(async (state: string | null, formData: FormData) => {
    const res = await addProduct(formData);
    if (res?.error) return res.error;
    return null;
  }, null);

  const handleUpdate = (id: string, change: number) => {
    startTransition(async () => {
      const res = await updateProductAmount(id, change);
      if (res?.error) {
        alert("Error updating: " + res.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      startTransition(async () => {
        const res = await deleteProduct(id);
        if (res?.error) {
          alert("Error deleting: " + res.error);
        }
      });
    }
  };

  return (
    <div className="grid">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-panel">
          <h2>Add New Product</h2>
          {addError && <div className="error-msg">{addError}</div>}
          <form action={addAction}>
            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input type="text" id="name" name="name" className="input" placeholder="e.g. Mechanical Keyboard" required />
            </div>
            <div className="form-group">
              <label htmlFor="amount">Initial Amount</label>
              <input type="number" id="amount" name="amount" className="input" placeholder="e.g. 50" min="1" required />
            </div>
            <button type="submit" className="btn btn-success" disabled={isPending}>
              {isPending ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </div>

        <div className="glass-panel">
          <h2>Inventory Database</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {initialProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center" style={{ color: '#94a3b8' }}>No products found.</td>
                  </tr>
                ) : (
                  initialProducts.map(product => (
                    <tr key={product.id}>
                      <td style={{ fontWeight: 500 }}>{product.name}</td>
                      <td>
                        <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>{product.amount}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn" 
                            onClick={() => handleUpdate(product.id, -1)}
                            disabled={product.amount <= 0 || isPending}
                            title="Decrease by 1"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          </button>
                          <button 
                            className="action-btn" 
                            onClick={() => handleUpdate(product.id, 1)}
                            disabled={isPending}
                            title="Increase by 1"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          </button>
                          <button 
                            className="action-btn" 
                            style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                            onClick={() => handleDelete(product.id)}
                            disabled={isPending}
                            title="Delete product"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <div className="glass-panel" style={{ height: '100%' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ marginBottom: 0 }}>Activity Log</h2>
            <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Last 50 actions</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {initialLogs.length === 0 ? (
              <div className="text-center" style={{ color: '#94a3b8', padding: '2rem 0' }}>No activity logs yet.</div>
            ) : (
              initialLogs.map(log => (
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
                      <strong>{log.quantity}</strong> units of <strong style={{ color: '#fff' }}>{log.product_name}</strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
