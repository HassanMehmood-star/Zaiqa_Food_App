import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import MealCard from '../components/MealCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const FALLBACK_BANNER = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=70';

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem, pendingConflict, confirmReplaceCart, cancelConflict } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/restaurants/${id}`),
      api.get(`/restaurants/${id}/meals`),
    ])
      .then(([rRes, mRes]) => {
        setRestaurant(rRes.data.restaurant);
        setMeals(mRes.data.meals);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleAdd(meal) {
    if (!user) {
      toast.error('Please log in to add items to your cart');
      return;
    }
    if (user.role !== 'regular_user') {
      toast.error('Only customer accounts can order food');
      return;
    }
    addItem(meal.id, 1);
  }

  if (loading) return <LoadingSpinner full />;
  if (!restaurant) return <EmptyState icon={UtensilsCrossed} title="Restaurant not found" />;

  const filteredMeals = meals.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="h-56 sm:h-72 bg-border overflow-hidden">
        <img
          src={restaurant.image || FALLBACK_BANNER}
          alt={restaurant.name}
          className="h-full w-full object-cover"
          onError={(e) => { e.target.src = FALLBACK_BANNER; }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 relative">
        <div className="card p-6 mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold">{restaurant.name}</h1>
              {restaurant.food_type && <span className="badge bg-primary-light text-primary-dark mt-2">{restaurant.food_type}</span>}
            </div>
          </div>
          {restaurant.description && <p className="text-muted mt-4 max-w-2xl">{restaurant.description}</p>}
        </div>

        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input className="input pl-11" placeholder="Search the menu…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {filteredMeals.length === 0 ? (
          <EmptyState icon={UtensilsCrossed} title="No meals found" message="This restaurant hasn't added any meals matching your search yet." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
            {filteredMeals.map((meal) => <MealCard key={meal.id} meal={meal} onAdd={handleAdd} />)}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!pendingConflict}
        title="Start a new order?"
        message="Your cart contains items from another restaurant. Would you like to clear your cart and start a new order?"
        confirmLabel="Clear cart & continue"
        onConfirm={confirmReplaceCart}
        onCancel={cancelConflict}
      />
    </div>
  );
}
