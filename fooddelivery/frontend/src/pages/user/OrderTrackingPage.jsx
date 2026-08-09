import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, Circle, XCircle, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';

const STEPS = ['Placed', 'Processing', 'In Route', 'Delivered', 'Received'];

// Owner-facing action button per current status.
const OWNER_ACTIONS = {
  Placed: { label: 'Start Processing', next: 'Processing' },
  Processing: { label: 'Mark In Route', next: 'In Route' },
  'In Route': { label: 'Mark Delivered', next: 'Delivered' },
};

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order))
      .catch((err) => toast.error(err.message)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(status) {
    setUpdating(true);
    try {
      const { data } = await api.patch(`/orders/${id}/status`, { status });
      setOrder(data.order);
      toast.success(`Order marked as ${status}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
      setConfirmCancel(false);
    }
  }

  if (loading) return <LoadingSpinner full />;
  if (!order) return null;

  const currentIndex = STEPS.indexOf(order.status);
  const isCanceled = order.status === 'Canceled';
  const isOwner = user.role === 'restaurant_owner';
  const ownerAction = isOwner && OWNER_ACTIONS[order.status];
  const canCustomerCancel = !isOwner && order.status === 'Placed';
  const canCustomerReceive = !isOwner && order.status === 'Delivered';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link to={isOwner ? '/owner/orders' : '/orders'} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold">Order #{order.id}</h1>
          <p className="text-muted text-sm">{order.restaurant_name} {isOwner && `· ${order.customer_name}`}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Signature element: receipt-stub tracker */}
      <div className="relative card p-6 mb-8 overflow-hidden">
        <div
          className="absolute left-0 right-0 top-0 h-3"
          style={{
            backgroundImage: 'radial-gradient(circle, #FFF8F3 3px, transparent 3.5px)',
            backgroundSize: '14px 14px',
            backgroundPosition: '7px -6px',
          }}
        />
        {isCanceled ? (
          <div className="flex flex-col items-center py-8 text-center">
            <XCircle className="h-10 w-10 text-danger mb-3" />
            <p className="font-display text-lg font-semibold">Order Canceled</p>
            <p className="text-xs text-muted font-mono mt-1">
              {new Date(order.history.find((h) => h.status === 'Canceled')?.changed_at || order.updated_at).toLocaleString()}
            </p>
          </div>
        ) : (
          <ol className="relative pl-1">
            {STEPS.map((step, idx) => {
              const done = idx <= currentIndex;
              const historyEntry = order.history.find((h) => h.status === step);
              return (
                <li key={step} className="relative pl-9 pb-8 last:pb-0">
                  {idx < STEPS.length - 1 && (
                    <span className={`absolute left-[13px] top-6 bottom-0 w-0.5 ${idx < currentIndex ? 'bg-secondary' : 'bg-border'}`} />
                  )}
                  <span className={`absolute left-0 top-0 h-7 w-7 rounded-full flex items-center justify-center ${done ? 'bg-secondary text-white' : 'bg-border text-muted'}`}>
                    {done ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3 fill-current" />}
                  </span>
                  <p className={`text-sm font-semibold ${done ? 'text-ink' : 'text-muted'}`}>{step}</p>
                  {historyEntry && (
                    <p className="text-xs text-muted font-mono mt-0.5">
                      {new Date(historyEntry.changed_at).toLocaleString()} — {historyEntry.changed_by_name || historyEntry.changed_by_role}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {(ownerAction || canCustomerCancel || canCustomerReceive) && (
        <div className="flex flex-wrap gap-3 mb-10">
          {ownerAction && (
            <button disabled={updating} onClick={() => changeStatus(ownerAction.next)} className="btn-primary">
              {updating ? 'Updating…' : ownerAction.label}
            </button>
          )}
          {canCustomerReceive && (
            <button disabled={updating} onClick={() => changeStatus('Received')} className="btn-secondary">
              {updating ? 'Updating…' : 'Mark as Received'}
            </button>
          )}
          {canCustomerCancel && (
            <button disabled={updating} onClick={() => setConfirmCancel(true)} className="btn-outline">
              Cancel order
            </button>
          )}
        </div>
      )}

      <div className="card p-5">
        <h2 className="font-semibold text-sm text-muted uppercase tracking-wide mb-3">Items</h2>
        <div className="space-y-1.5 text-sm">
          {order.items.map((i) => (
            <div key={i.id} className="flex justify-between">
              <span>{i.quantity} × {i.meal_name_snapshot}</span>
              <span className="font-mono">Rs {Number(i.subtotal).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-semibold pt-3 mt-3 border-t border-border">
          <span>Total</span>
          <span className="font-mono">Rs {Number(order.total_amount).toLocaleString()}</span>
        </div>
      </div>

      <ConfirmModal
        open={confirmCancel}
        title="Cancel this order?"
        message="This can't be undone. The restaurant will be notified that the order was canceled."
        confirmLabel="Cancel order"
        danger
        onConfirm={() => changeStatus('Canceled')}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
}
