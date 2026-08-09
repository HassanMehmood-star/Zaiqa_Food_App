import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, Clock, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import RestaurantCard from '../../components/RestaurantCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then(({ data }) => setData(data.dashboard));
  }, []);

  if (!data) return <LoadingSpinner full />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold mb-1">Welcome back, {user.full_name.split(' ')[0]}!</h1>
      <p className="text-muted mb-8">Here's what's happening with your orders.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Receipt} label="Total Orders" value={data.total_orders} accent="primary" />
        <StatCard icon={Clock} label="Active Orders" value={data.active_orders} accent="amber" />
        <StatCard icon={CheckCircle2} label="Completed" value={data.completed_orders} accent="secondary" />
        <StatCard icon={XCircle} label="Canceled" value={data.canceled_orders} accent="danger" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold">Recent orders</h2>
        <Link to="/orders" className="text-sm text-primary font-medium hover:underline">View all</Link>
      </div>
      <div className="card divide-y divide-border mb-10">
        {data.recentOrders.length === 0 ? (
          <p className="p-6 text-sm text-muted text-center">No orders yet — go explore restaurants!</p>
        ) : data.recentOrders.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center justify-between p-4 hover:bg-primary-light/40 transition-colors">
            <div>
              <p className="font-mono text-sm font-semibold">#{o.id}</p>
              <p className="text-sm text-muted">{o.restaurant_name}</p>
            </div>
            <p className="font-mono text-sm">Rs {Number(o.total_amount).toLocaleString()}</p>
            <StatusBadge status={o.status} />
          </Link>
        ))}
      </div>

      {data.popularRestaurants?.length > 0 && (
        <>
          <h2 className="font-display text-xl font-semibold mb-4">Popular restaurants</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.popularRestaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        </>
      )}
    </div>
  );
}
