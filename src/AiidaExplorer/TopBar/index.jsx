import {
  GroupIcon,
  LinksIcon,
  QuestionIcon,
  BugIcon,
  FullscreenIcon,
  SnapshotIcon,
} from "../components/Icons";

function ToolbarButton({ icon, label, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`explorerButton ae:flex ae:items-center ae:gap-1 ${className}`}
      {...props}
    >
      {icon}
      <span className="ae:hidden ae:@sm:inline">{label}</span>
    </button>
  );
}

export default function TopControls({
  onFindNode,
  onGetLinkCounts,
  onCollapseAll,
  onSnapshot,
  onHelp,
  onDebug,
  onFullscreen,
  isLoading,
  disableGetCounts = false,
  debugMode = false,
  fullscreenToggle = false,
}) {
  return (
    // Mark this as a container for Tailwind container queries
    <div className="ae:@container ae:w-full ae:shadow-md ae:bg-slate-100 ae:border-b ae:px-4 ae:py-2 ae:flex ae:justify-between ae:items-center ae:z-50">
      {/* Left side buttons */}
      <div className="ae:flex ae:gap-2">
        <ToolbarButton
          onClick={onFindNode}
          icon={<GroupIcon className="ae:w-5 ae:h-5" />}
          label="Find Node"
        />

        <ToolbarButton
          onClick={onGetLinkCounts}
          disabled={disableGetCounts || isLoading}
          icon={<LinksIcon className="ae:w-5 ae:h-5" />}
          label="Get Link Counts"
        />

        <ToolbarButton
          onClick={onCollapseAll}
          title="Collapse all expansions back to the root node"
          icon={
            <span className="ae:text-sm ae:font-medium ae:leading-none">
              −
            </span>
          }
          label="Collapse All"
        />

        <ToolbarButton
          onClick={onSnapshot}
          title="Download a PNG snapshot of the whole graph"
          icon={<SnapshotIcon className="ae:w-5 ae:h-5" />}
          label="Save Graph"
        />
      </div>

      {/* Right side buttons */}
      <div className="ae:flex ae:gap-2">
        <ToolbarButton
          onClick={onHelp}
          icon={<QuestionIcon className="ae:w-5 ae:h-5" />}
          label="Help"
        />

        {debugMode && onDebug && (
          <ToolbarButton
            onClick={onDebug}
            className="ae:text-red-600"
            icon={<BugIcon className="ae:w-5 ae:h-5" />}
            label="Debug"
          />
        )}

        {fullscreenToggle && onFullscreen && (
          <ToolbarButton
            onClick={onFullscreen}
            icon={<FullscreenIcon className="ae:w-5 ae:h-5" />}
            label="Fullscreen"
          />
        )}
      </div>
    </div>
  );
}
