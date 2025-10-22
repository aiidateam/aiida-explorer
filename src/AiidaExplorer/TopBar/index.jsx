import { GroupIcon, LinksIcon, QuestionIcon } from "../components/Icons";

export default function TopControls({
  onFindNode,
  onGetLinkCounts,
  onHelp,
  isLoading,
  disableGetCounts = false,

  buttonStyle = "group px-3 py-1 bg-slate-200 text-slate-700 flex items-center gap-1 rounded transition hover:bg-slate-300",
}) {
  return (
    <div className="w-full shadow-md bg-slate-100 border-b px-4 py-2 flex justify-between items-center z-50">
      {/* Left side buttons */}
      <div className="flex gap-2">
        <button className={buttonStyle} onClick={onFindNode}>
          <GroupIcon className="w-5 h-5" />
          <span>Find Node</span>
        </button>

        <button
          className={buttonStyle}
          onClick={onGetLinkCounts}
          disabled={disableGetCounts || isLoading}
        >
          <LinksIcon className="w-5 h-5" />
          <span>Get Link Counts</span>
        </button>
      </div>

      {/* Right side button */}
      <button className={buttonStyle} onClick={onHelp}>
        <QuestionIcon className="w-5 h-5" />
        <span>Help</span>
      </button>
    </div>
  );
}
