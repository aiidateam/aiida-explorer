import { GroupIcon, LinksIcon, QuestionIcon } from "../components/Icons";

export default function TopControls({
  onFindNode,
  onGetLinkCounts,
  onHelp,
  isLoading,
  disableGetCounts = false,
}) {
  return (
    <div className="w-full shadow-md bg-theme-50 border-b px-4 py-2 flex justify-between items-center z-50">
      {/* Left side buttons */}
      <div className="flex gap-2">
        <button
          className="group px-3 py-1 rounded-md bg-theme-200 text-theme-700 flex items-center gap-1 hover:bg-theme-300 transition-colors"
          onClick={onFindNode}
        >
          <GroupIcon className="w-5 h-5" />
          <span>Find Node</span>
        </button>

        <button
          className="group px-3 py-1 rounded-md bg-theme-200 text-theme-700 flex items-center gap-1 hover:bg-theme-300 transition-colors"
          onClick={onGetLinkCounts}
          disabled={disableGetCounts || isLoading}
        >
          <LinksIcon className="w-5 h-5" />
          <span>Get Link Counts</span>
        </button>
      </div>

      {/* Right side button */}
      <button
        className="group px-3 py-1 rounded-md bg-theme-200 text-theme-700 flex items-center gap-1 hover:bg-theme-300 transition-colors"
        onClick={onHelp}
      >
        <QuestionIcon className="w-5 h-5" />
        <span>Help</span>
      </button>
    </div>
  );
}
