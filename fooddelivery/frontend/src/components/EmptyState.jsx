export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="h-14 w-14 rounded-full bg-primary-light flex items-center justify-center mb-4">
          <Icon className="h-7 w-7 text-primary" strokeWidth={1.75} />
        </div>
      )}
      <h3 className="font-display text-xl font-semibold mb-1">{title}</h3>
      {message && <p className="text-muted text-sm max-w-sm mb-5">{message}</p>}
      {action}
    </div>
  );
}
