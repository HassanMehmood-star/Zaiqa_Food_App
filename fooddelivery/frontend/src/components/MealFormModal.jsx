import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function MealFormModal({ open, initial, onSubmit, onClose, submitting }) {
  const [form, setForm] = useState({ name: '', description: '', price: '', image: '', isAvailable: true });

  useEffect(() => {
    if (open) {
      setForm({
        name: initial?.name || '',
        description: initial?.description || '',
        price: initial?.price ?? '',
        image: initial?.image || '',
        isAvailable: initial?.is_available ?? true,
      });
    }
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4">
      <div className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-semibold">{initial ? 'Edit meal' : 'Add meal'}</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-muted" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, price: Number(form.price) }); }} className="space-y-4">
          <div>
            <label className="label">Meal name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Price (Rs)</label>
            <input required type="number" min="0" step="0.01" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className="label">Image URL</label>
            <input className="input" placeholder="https://…" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>
          {initial && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="rounded border-border" />
              Available for ordering
            </label>
          )}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add meal'}
          </button>
        </form>
      </div>
    </div>
  );
}
