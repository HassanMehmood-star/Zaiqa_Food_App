import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Pizza, Beef, Soup, Cake, Sandwich, Utensils } from 'lucide-react';
import api from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import SkeletonCard from '../components/SkeletonCard';

const CATEGORIES = [
  { label: 'Pizza', icon: Pizza },
  { label: 'Burgers', icon: Sandwich },
  { label: 'Pakistani', icon: Utensils },
  { label: 'Chinese', icon: Soup },
  { label: 'Fast Food', icon: Beef },
  { label: 'Desserts', icon: Cake },
];

export default function LandingPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/restaurants').then(({ data }) => setRestaurants(data.restaurants.slice(0, 6)))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-light/60 to-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="badge bg-primary text-white mb-5">Faisalabad · Chiniot · and beyond</span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.08] mb-5">
              Delicious Food,<br /><span className="text-primary">Delivered to Your Door</span>
            </h1>
            <p className="text-muted text-base mb-8 max-w-md">
              Discover amazing restaurants and enjoy your favorite meals anytime — hot, fresh, and on time.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/restaurants" className="btn-primary">
                Explore Restaurants <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register" className="btn-outline">Get Started</Link>
            </div>
          </div>
          <div className="relative">
            <div className="card p-2 rotate-2">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=70"
                alt="Assorted delicious food spread"
                className="rounded-xl h-72 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-display text-2xl font-semibold mb-6">Browse by category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {CATEGORIES.map(({ label, icon: Icon }) => (
            <Link
              key={label}
              to={`/restaurants?foodType=${encodeURIComponent(label)}`}
              className="card card-hover flex flex-col items-center gap-2 py-6 text-sm font-medium"
            >
              <span className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-primary">
                <Icon className="h-5 w-5" />
              </span>
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Popular restaurants */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold">Popular restaurants</h2>
          <Link to="/restaurants" className="text-sm font-medium text-primary hover:underline">View all</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : restaurants.length === 0
            ? <p className="text-muted col-span-full text-center py-10">No restaurants yet — check back soon.</p>
            : restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
        </div>
      </section>
    </div>
  );
}
