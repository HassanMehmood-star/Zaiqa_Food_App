import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const FILTERS = ['All', 'Placed', 'Processing', 'In Route', 'Delivered', 'Received', 'Canceled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    setLoading(true);
    const params = filter === 'All' ? {} : { status: filter };
    api.get('/orders', { params }).then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold mb-6">Your orders</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`badge cursor-pointer ${filter === f ? 'bg-primary text-white' : 'bg-primary-light text-primary-dark hover:bg-primary hover:text-white'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : orders.length === 0 ? (
        <EmptyState icon={Receipt} title="No orders here" message="Orders matching this filter will show up here." />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} to={`/orders/${o.id}`} className="card card-hover flex items-center justify-between p-4 gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-sm font-mono">#{o.id}</p>
                <p className="text-sm text-muted truncate">{o.restaurant_name}</p>
              </div>
              <p className="text-xs text-muted hidden sm:block">{new Date(o.order_date).toLocaleString()}</p>
              <p className="font-mono font-semibold text-sm">Rs {Number(o.total_amount).toLocaleString()}</p>
              <StatusBadge status={o.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
