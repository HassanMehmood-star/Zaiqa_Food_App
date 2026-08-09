import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, UtensilsCrossed } from 'lucide-react';
import api from '../../services/api';
import MealFormModal from '../../components/MealFormModal';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MealManagementPage() {
  const [params, setParams] = useSearchParams();
  const restaurantId = params.get('restaurantId') || '';
  const [restaurants, setRestaurants] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/restaurants/mine').then(({ data }) => {
      setRestaurants(data.restaurants);
      if (!restaurantId && data.restaurants.length > 0) {
        setParams({ restaurantId: data.restaurants[0].id });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadMeals() {
    if (!restaurantId) return;
    setLoading(true);
    api.get(`/restaurants/${restaurantId}/meals`).then(({ data }) => setMeals(data.meals)).finally(() => setLoading(false));
  }
  useEffect(loadMeals, [restaurantId]);

  async function handleSubmit(form) {
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/meals/${editing.id}`, form);
        toast.success('Meal updated');
      } else {
        await api.post('/meals', { ...form, restaurantId: Number(restaurantId) });
        toast.success('Meal added');
      }
      setModalOpen(false);
      setEditing(null);
      loadMeals();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/meals/${deleting.id}`);
      toast.success('Meal deleted');
      setDeleting(null);
      loadMeals();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-3xl font-semibold">Meal management</h1>
        <button
          disabled={!restaurantId}
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" /> Add meal
        </button>
      </div>

      {restaurants.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="Add a restaurant first" message="You need at least one restaurant before adding meals." />
      ) : (
        <>
          <div className="mb-6 max-w-xs">
            <label className="label">Restaurant</label>
            <select className="input" value={restaurantId} onChange={(e) => setParams({ restaurantId: e.target.value })}>
              {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          {loading ? <LoadingSpinner /> : meals.length === 0 ? (
            <EmptyState icon={UtensilsCrossed} title="No meals yet" message="Add meals so customers can start ordering." />
          ) : (
            <div className="card divide-y divide-border">
              {meals.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{m.name}</p>
                    <p className="text-xs text-muted truncate max-w-md">{m.description}</p>
                  </div>
                  <span className="font-mono text-sm font-semibold shrink-0">Rs {Number(m.price).toLocaleString()}</span>
                  {!m.is_available && <span className="badge bg-danger-light text-danger shrink-0">Hidden</span>}
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setEditing(m); setModalOpen(true); }} className="btn-outline !px-3 !py-1.5 text-xs">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleting(m)} className="btn-outline !px-3 !py-1.5 text-xs hover:!border-danger hover:!text-danger">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <MealFormModal
        open={modalOpen}
        initial={editing}
        submitting={submitting}
        onSubmit={handleSubmit}
        onClose={() => { setModalOpen(false); setEditing(null); }}
      />
      <ConfirmModal
        open={!!deleting}
        title="Delete meal?"
        message={`"${deleting?.name}" will be permanently removed from the menu.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
