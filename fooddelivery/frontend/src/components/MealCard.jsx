import { Plus } from 'lucide-react';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60';

export default function MealCard({ meal, onAdd }) {
  return (
    <div className="card card-hover overflow-hidden flex flex-col">
      <div className="h-36 overflow-hidden bg-border">
        <img
          src={meal.image || FALLBACK_IMG}
          alt={meal.name}
          className="h-full w-full object-cover"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-semibold text-sm leading-tight">{meal.name}</h4>
        {meal.description && <p className="text-xs text-muted mt-1 line-clamp-2 flex-1">{meal.description}</p>}
        <div className="flex items-center justify-between mt-3">
          <span className="font-mono font-semibold text-primary-dark">Rs {Number(meal.price).toLocaleString()}</span>
          {meal.is_available === false ? (
            <span className="text-xs text-muted">Unavailable</span>
          ) : (
            <button onClick={() => onAdd(meal)} className="btn-primary !px-3 !py-2 text-xs">
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
