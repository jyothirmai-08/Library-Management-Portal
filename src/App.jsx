
import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  Link,
  useNavigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Members from "./pages/Members";
import Circulation from "./pages/Circulation";
import Transactions from "./pages/Transactions";
import ChangePassword from "./pages/ChangePassword";

function PrivateLayout({ user, onLogout }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <header className="navbar">
        <h2>📚 My Library</h2>

        <nav className="nav-links">
            <Link to="/">Dashboard</Link>
            <Link to="/books">Books</Link>
            <Link to="/members">Members</Link>
             <Link to="/circulation">Circulation</Link>
            <Link to="/transactions">Transactions</Link>
            <Link to="/change-password">Change Password</Link>
          <button onClick={onLogout}>Logout</button>
       </nav>

        <p>Welcome, {user.name || user.username}!</p>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      return token && savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  function handleLogin(userData) {
    setUser(userData);
    navigate("/", { replace: true });
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login", { replace: true });
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
        }
      />

      <Route
        path="/register"
        element={
          user ? <Navigate to="/" replace /> : <Register />
        }
      />

      <Route element={<PrivateLayout user={user} onLogout={handleLogout} />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/books" element={<Books />} />
        <Route path="/members" element={<Members />} />
        <Route path="/circulation" element={<Circulation />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={user ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
