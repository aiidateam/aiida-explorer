export default function ErrorDisplay({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center text-red-500 p-4">
      {/* Error icon */}
      <div className="text-5xl mb-2">⚠️</div>
      <span className="text-sm font-semibold">Failed to load data</span>
      {message && <span className="text-xs text-gray-400 mt-1">{message}</span>}

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
        >
          Retry
        </button>
      )}
    </div>
  );
}
