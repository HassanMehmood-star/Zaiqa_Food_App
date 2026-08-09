export default function LoadingSpinner({ full = false }) {
  return (
    <div className={`flex items-center justify-center ${full ? 'min-h-[50vh]' : 'py-10'}`}>
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}
