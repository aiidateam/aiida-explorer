// common CardContainer component that applies a nice border around children.
// Useful for giving visual seperation to many components.
// tailwind classNames can be override using (example) ae:!p-0
export default function CardContainer({
  children,
  header,
  footer,
  className = "",
  childrenClassName = "",
  style = {},
}) {
  return (
    <div
      className={`ae:w-full ae:max-w-full ae:bg-slate-100 ae:border ae:border-slate-200 ae:p-3 ae:rounded-md ae:shadow-md ${className}`}
      style={style}
    >
      {header && <div className="explorerHeadingBig ae:mb-2">{header}</div>}
      <div className={`ae:px-1 ${childrenClassName}`}>{children}</div>
      {footer && (
        <div className="ae:mt-2 ae:text-sm ae:text-gray-500">{footer}</div>
      )}
    </div>
  );
}
