export default function Navbar({
  user = { name: "Guest", role: "student" },
  onLogout,
  showLogout = true
}) {
  const roleColor =
    user.role === "admin"
      ? "text-red-400"
      : user.role === "proctor"
      ? "text-yellow-400"
      : "text-green-400";

  return (
    <nav className="glass-card">
      <div className="glass-card-inner">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center"
              aria-label="ExamGuard logo"
            >
              <span className="text-lg font-bold gradient-insta">EG</span>
            </div>
            <h1 className="text-xl font-bold gradient-insta">
              ExamGuard
            </h1>
          </div>

          {/* User info */}
          <div className="flex items-center gap-4">
            <div className="bg-gray-900 rounded-xl px-4 py-2 text-right">
              <p className="text-white font-medium">
                {user.name || "Unknown User"}
              </p>
              <p
                className={`text-sm capitalize ${roleColor}`}
              >
                {user.role || "student"}
              </p>
            </div>

            {/* Logout */}
            {showLogout && onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-gray-900 rounded-lg text-gray-400 hover:text-white transition-colors"
                aria-label="Logout"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
