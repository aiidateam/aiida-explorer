import {
  GroupIcon,
  LinksIcon,
  QuestionIcon,
  BugIcon,
  FullscreenIcon,
} from "../components/Icons";

export default function TopControls({
  onFindNode,
  onGetLinkCounts,
  onHelp,
  onDebug,
  onFullscreen,
  isLoading,
  disableGetCounts = false,
  debugMode = false,
  fullscreenToggle = false,
}) {
  const textStyle = "ae:hidden ae:@sm:inline";

  return (
    // Mark this as a container for Tailwind container queries
    <div className="ae:@container ae:w-full ae:shadow-md ae:bg-slate-100 ae:border-b ae:px-4 ae:py-2 ae:flex ae:justify-between ae:items-center ae:z-50">
      {/* Left side buttons */}
      <div className="ae:flex ae:gap-2">
        <button
          className="explorerButton ae:flex ae:items-center ae:gap-1"
          onClick={onFindNode}
        >
          <GroupIcon className="ae:w-5 ae:h-5" />
          <span className={textStyle}>Find Node</span>
        </button>

        <button
          className="explorerButton ae:flex ae:items-center ae:gap-1"
          onClick={onGetLinkCounts}
          disabled={disableGetCounts || isLoading}
        >
          <LinksIcon className="ae:w-5 ae:h-5" />
          <span className={textStyle}>Get Link Counts</span>
        </button>
      </div>

      {/* Right side buttons */}
      <div className="ae:flex ae:gap-2">
        <button
          className="explorerButton ae:flex ae:items-center ae:gap-1"
          onClick={onHelp}
        >
          <QuestionIcon className="ae:w-5 ae:h-5" />
          <span className={textStyle}>Help</span>
        </button>

        {debugMode && onDebug && (
          <button
            className="explorerButton ae:flex ae:items-center ae:gap-1 ae:text-red-600"
            onClick={onDebug}
          >
            <BugIcon className="ae:w-5 ae:h-5" />
            <span className={textStyle}>Debug</span>
          </button>
        )}

        {fullscreenToggle && onFullscreen && (
          <button
            className="explorerButton ae:flex ae:items-center ae:gap-1"
            onClick={onFullscreen}
          >
            <FullscreenIcon className="ae:w-5 ae:h-5" />
            <span className={textStyle}>Fullscreen</span>
          </button>
        )}
      </div>
    </div>
  );
}
