import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Store, UtensilsCrossed, Users } from 'lucide-react';
import api from '../../services/api';
import RestaurantFormModal from '../../components/RestaurantFormModal';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=60';

export default function MyRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    api.get('/restaurants/mine').then(({ data }) => setRestaurants(data.restaurants)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleSubmit(form) {
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/restaurants/${editing.id}`, form);
        toast.success('Restaurant updated');
      } else {
        await api.post('/restaurants', form);
        toast.success('Restaurant created');
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/restaurants/${deleting.id}`);
      toast.success('Restaurant deleted');
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold">My restaurants</h1>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add restaurant
        </button>
      </div>

      {loading ? <LoadingSpinner /> : restaurants.length === 0 ? (
        <EmptyState icon={Store} title="No restaurants yet" message="Add your first restaurant to start selling on Zaiqa."
          action={<button onClick={() => setModalOpen(true)} className="btn-primary">Add restaurant</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r) => (
            <div key={r.id} className="card overflow-hidden">
              <div className="h-32 bg-border overflow-hidden">
                <img src={r.image || FALLBACK_IMG} alt={r.name} className="h-full w-full object-cover"
                  onError={(e) => { e.target.src = FALLBACK_IMG; }} />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">{r.name}</h3>
                  {!r.is_active && <span className="badge bg-danger-light text-danger">Inactive</span>}
                </div>
                <p className="text-xs text-muted mb-3">{r.food_type}</p>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/owner/meals?restaurantId=${r.id}`} className="btn-outline !px-3 !py-1.5 text-xs">
                    <UtensilsCrossed className="h-3.5 w-3.5" /> Meals
                  </Link>
                  <Link to={`/owner/users?restaurantId=${r.id}`} className="btn-outline !px-3 !py-1.5 text-xs">
                    <Users className="h-3.5 w-3.5" /> Users
                  </Link>
                  <button onClick={() => { setEditing(r); setModalOpen(true); }} className="btn-outline !px-3 !py-1.5 text-xs">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setDeleting(r)} className="btn-outline !px-3 !py-1.5 text-xs hover:!border-danger hover:!text-danger">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RestaurantFormModal
        open={modalOpen}
        initial={editing}
        submitting={submitting}
        onSubmit={handleSubmit}
        onClose={() => { setModalOpen(false); setEditing(null); }}
      />
      <ConfirmModal
        open={!!deleting}
        title="Delete restaurant?"
        message={`This will permanently delete "${deleting?.name}" and all of its meals. This can't be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
