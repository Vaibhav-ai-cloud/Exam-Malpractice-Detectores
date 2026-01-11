import { useEffect } from "react";

export default function AlertBanner({
  message,
  type = "warning",
  title = "Alert",
  autoHide = false,
  onClose
}) {
  const styles = {
    warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
    error: "bg-red-500/20 text-red-300 border-red-500/50",
    info: "bg-blue-500/20 text-blue-300 border-blue-500/50",
    success: "bg-green-500/20 text-green-300 border-green-500/50"
  };

  const icons = {
    warning: "⚠️",
    error: "❌",
    info: "ℹ️",
    success: "✓"
  };

  const safeType = styles[type] ? type : "warning";

  // Optional auto hide
  useEffect(() => {
    if (!autoHide || !onClose) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [autoHide, onClose]);

  return (
    <div
      role="alert"
      className={`glass-dark rounded-xl p-4 border ${styles[safeType]}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icons[safeType]}</span>

        <div className="flex-1">
          <p className="font-medium">{title}</p>
          <p className="text-sm opacity-90">{message}</p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="opacity-70 hover:opacity-100 transition"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
