import JsonView from "@uiw/react-json-view";

export default function DebugViewer({ debugInfo }) {
  return (
    <div className="ae:p-2 ae:w-full ae:h-full ae:overflow-y-auto ae:bg-white">
      {/* Overview */}
      <section className="ae:mb-4">
        <div className="ae:text-lg ae:mb-3 ae:flex ae:items-center ae:gap-2">
          Debug Overview
        </div>
        <p className="ae:text-gray-700 ae:leading-relaxed">
          This panel displays current debug and performance information for the
          Aiida Explorer. You can inspect cache statistics, node fetch timings,
          breadcrumb counts, and other runtime metrics in real time.
        </p>
      </section>

      {/* JSON Debug Info */}
      <section>
        <div className="ae:text-md ae-font-semibold ae:mb-2">
          Debug Info JSON
        </div>
        <div className="ae:max-h-[60vh] ae:overflow-auto ae:border ae:border-gray-200 ae:rounded ae:p-2 ae:bg-gray-50">
          <JsonView
            value={debugInfo}
            collapsed={false}
            displayDataTypes={false}
            enableClipboard={true}
            highlightUpdates={false} // avoid console spam
            theme="rjv-default"
          />
        </div>
      </section>
    </div>
  );
}
