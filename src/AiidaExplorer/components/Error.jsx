export default function ErrorDisplay({ message, onRetry }) {
  return (
    <div className="ae:flex ae:flex-col ae:items-center ae:text-red-500 ae:p-4">
      {/* Error icon */}
      <div className="ae:text-5xl ae:mb-2">⚠️</div>
      <span className="ae:text-sm ae:font-medium">Failed to load data</span>
      {message && (
        <span className="ae:text-xs ae:text-gray-400 ae:mt-1">{message}</span>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="ae:mt-3 ae:px-3 ae:py-1 ae:rounded-md ae:bg-red-500 ae:text-white ae:hover:bg-red-600 ae:hover:cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
}
