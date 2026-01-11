import { useState } from "react";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import StudentExam from "./pages/StudentExam";

export default function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    if (!userData?.role) return;

    setUser(userData);
    setCurrentPage(userData.role === "admin" ? "admin" : "student");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {currentPage === "login" && <Login onLogin={handleLogin} />}

      {currentPage === "admin" && user && (
        <AdminDashboard user={user} onLogout={handleLogout} />
      )}

      {currentPage === "student" && user && (
        <StudentExam user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
