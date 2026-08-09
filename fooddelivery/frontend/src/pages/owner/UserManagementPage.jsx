import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, UserX, ShieldOff, Users } from 'lucide-react';
import api from '../../services/api';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function UserManagementPage() {
  const [params, setParams] = useSearchParams();
  const restaurantId = params.get('restaurantId') || '';
  const [restaurants, setRestaurants] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/restaurants/mine').then(({ data }) => {
      setRestaurants(data.restaurants);
      if (!restaurantId && data.restaurants.length > 0) setParams({ restaurantId: data.restaurants[0].id });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadBlocked() {
    if (!restaurantId) return;
    setLoading(true);
    api.get(`/restaurants/${restaurantId}/blocked-users`).then(({ data }) => setBlockedUsers(data.users)).finally(() => setLoading(false));
  }
  useEffect(loadBlocked, [restaurantId]);

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return setSearchResults([]);
    try {
      const { data } = await api.get('/users', { params: { search: searchQuery } });
      setSearchResults(data.users);
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function blockUser(userId) {
    try {
      await api.post(`/restaurants/${restaurantId}/blocked-users/${userId}`);
      toast.success('User blocked from this restaurant');
      loadBlocked();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function unblockUser(userId) {
    try {
      await api.delete(`/restaurants/${restaurantId}/blocked-users/${userId}`);
      toast.success('User unblocked');
      loadBlocked();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const blockedIds = new Set(blockedUsers.map((u) => u.id));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold mb-6">User management</h1>

      {restaurants.length === 0 ? (
        <EmptyState icon={Users} title="Add a restaurant first" />
      ) : (
        <>
          <div className="mb-8 max-w-xs">
            <label className="label">Restaurant</label>
            <select className="input" value={restaurantId} onChange={(e) => setParams({ restaurantId: e.target.value })}>
              {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          <div className="card p-5 mb-8">
            <h2 className="font-semibold text-sm text-muted uppercase tracking-wide mb-3">Search users</h2>
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input className="input pl-11" placeholder="Search by name or email…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </form>
            {searchResults.length > 0 && (
              <div className="divide-y divide-border">
                {searchResults.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{u.full_name}</p>
                      <p className="text-xs text-muted">{u.email}</p>
                    </div>
                    {blockedIds.has(u.id) ? (
                      <span className="badge bg-danger-light text-danger">Blocked</span>
                    ) : (
                      <button onClick={() => blockUser(u.id)} className="btn-outline !px-3 !py-1.5 text-xs hover:!border-danger hover:!text-danger">
                        <UserX className="h-3.5 w-3.5" /> Block
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <h2 className="font-display text-xl font-semibold mb-4">Blocked users</h2>
          {loading ? <LoadingSpinner /> : blockedUsers.length === 0 ? (
            <EmptyState icon={ShieldOff} title="No blocked users" message="Users you block from this restaurant will appear here." />
          ) : (
            <div className="card divide-y divide-border">
              {blockedUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">{u.full_name}</p>
                    <p className="text-xs text-muted">{u.email} · blocked {new Date(u.blocked_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => unblockUser(u.id)} className="btn-outline !px-3 !py-1.5 text-xs">Unblock</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
