import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const FILTERS = ['All', 'Placed', 'Processing', 'In Route', 'Delivered', 'Received', 'Canceled'];

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    setLoading(true);
    const params = filter === 'All' ? {} : { status: filter };
    api.get('/orders', { params }).then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold mb-6">Orders management</h1>

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
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted uppercase tracking-wide border-b border-border">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-primary-light/30">
                  <td className="p-4 font-mono font-semibold">#{o.id}</td>
                  <td className="p-4">{o.customer_name}</td>
                  <td className="p-4 font-mono">Rs {Number(o.total_amount).toLocaleString()}</td>
                  <td className="p-4 text-muted">{new Date(o.order_date).toLocaleDateString()}</td>
                  <td className="p-4"><StatusBadge status={o.status} /></td>
                  <td className="p-4">
                    <Link to={`/orders/${o.id}`} className="text-primary font-medium hover:underline">Manage</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
