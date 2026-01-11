import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getDashboardData } from "../services/api";

export default function AdminDashboard({ user, onLogout }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 3000); // auto refresh
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await getDashboardData();
      setStudents(data);
      setLoading(false);
    } catch (err) {
      console.error("Dashboard fetch error", err);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar user={user} onLogout={onLogout} />

      <div className="p-6">
        <h1 className="text-3xl font-bold gradient-insta mb-6">
          Live Proctor Dashboard
        </h1>

        {loading ? (
          <p className="text-gray-400">Loading data...</p>
        ) : students.length === 0 ? (
          <p className="text-gray-400">No active students</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {students.map((s) => (
              <div key={s.student_id} className="glass-card">
                <div className="glass-card-inner space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white font-semibold">
                      {s.student_id}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        s.status === "CHEATING"
                          ? "bg-red-500/20 text-red-400"
                          : s.status === "SUSPICIOUS"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Score</span>
                    <span className="text-white font-bold">{s.score}</span>
                  </div>

                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        s.score >= 35
                          ? "bg-red-500"
                          : s.score >= 15
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(s.score, 50) * 2}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
