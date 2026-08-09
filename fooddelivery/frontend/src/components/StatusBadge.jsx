const STYLES = {
  Placed: 'bg-amber-light text-amber',
  Processing: 'bg-amber-light text-amber',
  'In Route': 'bg-primary-light text-primary-dark',
  Delivered: 'bg-secondary-light text-secondary-dark',
  Received: 'bg-secondary-light text-secondary-dark',
  Canceled: 'bg-danger-light text-danger',
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${STYLES[status] || 'bg-border text-muted'}`}>{status}</span>;
}
