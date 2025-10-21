// CardContainer.jsx
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
      className={`w-full max-w-full bg-theme-100 border border-theme-200 p-3 rounded-md shadow-md ${className}`}
      style={style}
    >
      {header && <div className="mb-2 font-semibold">{header}</div>}
      <div className={`px-1 ${childrenClassName}`}>{children}</div>
      {footer && <div className="mt-2 text-sm text-gray-500">{footer}</div>}
    </div>
  );
}
