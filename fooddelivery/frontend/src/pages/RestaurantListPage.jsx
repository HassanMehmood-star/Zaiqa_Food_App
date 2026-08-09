import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Store } from 'lucide-react';
import api from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['Pizza', 'Burgers', 'Pakistani', 'Chinese', 'Italian', 'Desserts', 'Fast Food'];

export default function RestaurantListPage() {
  const [params, setParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get('search') || '');
  const foodType = params.get('foodType') || '';

  useEffect(() => {
    setLoading(true);
    const query = {};
    if (search) query.search = search;
    if (foodType) query.foodType = foodType;
    api.get('/restaurants', { params: query })
      .then(({ data }) => setRestaurants(data.restaurants))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, foodType]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (search) next.set('search', search); else next.delete('search');
    setParams(next);
  }

  function toggleCategory(cat) {
    const next = new URLSearchParams(params);
    if (foodType === cat) next.delete('foodType'); else next.set('foodType', cat);
    setParams(next);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold mb-6">Discover restaurants</h1>

      <form onSubmit={handleSearchSubmit} className="relative mb-5 max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          className="input pl-11"
          placeholder="Search restaurants…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            className={`badge cursor-pointer transition-colors ${foodType === cat ? 'bg-primary text-white' : 'bg-primary-light text-primary-dark hover:bg-primary hover:text-white'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : restaurants.length === 0 ? (
        <EmptyState icon={Store} title="No restaurants found" message="Try a different search term or category." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
        </div>
      )}
    </div>
  );
}
