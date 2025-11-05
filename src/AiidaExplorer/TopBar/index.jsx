import {
  GroupIcon,
  LinksIcon,
  QuestionIcon,
  BugIcon,
} from "../components/Icons";

export default function TopControls({
  onFindNode,
  onGetLinkCounts,
  onHelp,
  onDebug,
  isLoading,
  disableGetCounts = false,
  debugMode = false,
}) {
  return (
    <div className="ae:w-full ae:shadow-md ae:bg-slate-100 ae:border-b ae:px-4 ae:py-2 ae:flex ae:justify-between ae:items-center ae:z-50">
      {/* Left side buttons */}
      <div className="ae:flex ae:gap-2">
        <button className="explorerButton" onClick={onFindNode}>
          <GroupIcon className="ae:w-5 ae:h-5" />
          <span>Find Node</span>
        </button>

        <button
          className="explorerButton"
          onClick={onGetLinkCounts}
          disabled={disableGetCounts || isLoading}
        >
          <LinksIcon className="ae:w-5 ae:h-5" />
          <span>Get Link Counts</span>
        </button>
      </div>

      {/* Right side buttons */}
      <div className="ae:flex ae:gap-2">
        <button className="explorerButton" onClick={onHelp}>
          <QuestionIcon className="ae:w-5 ae:h-5" />
          <span>Help</span>
        </button>

        {debugMode && onDebug && (
          <button className="explorerButton ae:text-red-600" onClick={onDebug}>
            <BugIcon className="ae:w-5 ae:h-5" />
            <span>Debug</span>
          </button>
        )}
      </div>
    </div>
  );
}
