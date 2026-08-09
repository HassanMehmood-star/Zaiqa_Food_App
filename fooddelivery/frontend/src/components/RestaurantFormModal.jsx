import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function RestaurantFormModal({ open, initial, onSubmit, onClose, submitting }) {
  const [form, setForm] = useState({ name: '', description: '', foodType: '', image: '' });

  useEffect(() => {
    if (open) {
      setForm({
        name: initial?.name || '',
        description: initial?.description || '',
        foodType: initial?.food_type || '',
        image: initial?.image || '',
      });
    }
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4">
      <div className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-semibold">{initial ? 'Edit restaurant' : 'Add restaurant'}</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-muted" /></button>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
          className="space-y-4"
        >
          <div>
            <label className="label">Restaurant name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Food type</label>
            <input className="input" placeholder="e.g. Pizza, Pakistani, Chinese" value={form.foodType} onChange={(e) => setForm({ ...form, foodType: e.target.value })} />
          </div>
          <div>
            <label className="label">Image URL</label>
            <input className="input" placeholder="https://…" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add restaurant'}
          </button>
        </form>
      </div>
    </div>
  );
}
