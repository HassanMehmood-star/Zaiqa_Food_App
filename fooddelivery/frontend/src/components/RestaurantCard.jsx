import { Link } from 'react-router-dom';
import { Star, ArrowUpRight } from 'lucide-react';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=60';

export default function RestaurantCard({ restaurant }) {
  return (
    <Link to={`/restaurants/${restaurant.id}`} className="card card-hover overflow-hidden group block">
      <div className="h-40 overflow-hidden bg-border">
        <img
          src={restaurant.image || FALLBACK_IMG}
          alt={restaurant.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-base leading-tight">{restaurant.name}</h3>
          <ArrowUpRight className="h-4 w-4 text-muted group-hover:text-primary shrink-0 mt-0.5" />
        </div>
        {restaurant.food_type && (
          <span className="badge bg-primary-light text-primary-dark mt-2">{restaurant.food_type}</span>
        )}
        {restaurant.description && (
          <p className="text-sm text-muted mt-2 line-clamp-2">{restaurant.description}</p>
        )}
        <div className="flex items-center gap-1 mt-3 text-xs text-muted">
          <Star className="h-3.5 w-3.5 fill-amber text-amber" />
          <span className="font-mono">4.{(restaurant.id % 9) + 1}</span>
          <span>· 20-30 min</span>
        </div>
      </div>
    </Link>
  );
}
