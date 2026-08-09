import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, UtensilsCrossed, Receipt, Clock, CheckCircle2, Wallet } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then(({ data }) => setData(data.dashboard));
  }, []);

  if (!data) return <LoadingSpinner full />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold mb-1">Welcome back, {user.full_name.split(' ')[0]}!</h1>
      <p className="text-muted mb-8">Here's how your restaurants are doing.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard icon={Store} label="Restaurants" value={data.total_restaurants} accent="primary" />
        <StatCard icon={UtensilsCrossed} label="Meals" value={data.total_meals} accent="primary" />
        <StatCard icon={Receipt} label="Total Orders" value={data.total_orders} accent="secondary" />
        <StatCard icon={Wallet} label="Revenue" value={`Rs ${Number(data.revenue).toLocaleString()}`} accent="secondary" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Clock} label="Pending" value={data.pending_orders} accent="amber" />
        <StatCard icon={Clock} label="Processing" value={data.processing_orders} accent="amber" />
        <StatCard icon={CheckCircle2} label="Completed" value={data.completed_orders} accent="secondary" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold">Recent orders</h2>
        <Link to="/owner/orders" className="text-sm text-primary font-medium hover:underline">View all</Link>
      </div>
      <div className="card divide-y divide-border">
        {data.recentOrders.length === 0 ? (
          <p className="p-6 text-sm text-muted text-center">No orders yet.</p>
        ) : data.recentOrders.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center justify-between p-4 hover:bg-primary-light/40 transition-colors">
            <div>
              <p className="font-mono text-sm font-semibold">#{o.id}</p>
              <p className="text-sm text-muted">{o.restaurant_name} · {o.customer_name}</p>
            </div>
            <p className="font-mono text-sm">Rs {Number(o.total_amount).toLocaleString()}</p>
            <StatusBadge status={o.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
