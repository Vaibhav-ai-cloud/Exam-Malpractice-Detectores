import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    // 🔥 Frontend-only auth (demo / hackathon ready)
    onLogin({
      email,
      role,
      name: email.split("@")[0],
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="glass-insta rounded-2xl w-full max-w-md">
        <div className="glass-insta-inner">

          {/* HEADER */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-insta mb-2">
              ExamGuard
            </h1>
            <p className="text-gray-400 text-sm">
              AI-Powered Online Exam Proctoring
            </p>
          </div>

          {/* ROLE SWITCH */}
          <div className="flex gap-2 p-1 bg-gray-900 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                role === "student"
                  ? "btn-insta"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Student
            </button>

            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                role === "admin"
                  ? "btn-insta"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Admin
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl input-insta outline-none"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl input-insta outline-none"
              required
            />

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full btn-insta py-4 rounded-xl text-lg font-semibold"
            >
              Sign In
            </button>
          </form>

          {/* FOOTER */}
          <p className="text-gray-500 text-xs text-center mt-6">
            Demo login · Backend authentication optional
          </p>
        </div>
      </div>
    </div>
  );
}
