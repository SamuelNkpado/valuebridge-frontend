import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Landing        from "./pages/Landing";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Dashboard      from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Businesses     from "./pages/Businesses";
import Valuations     from "./pages/Valuations";
import Marketplace    from "./pages/Marketplace";
import Messages       from "./pages/Messages";
import DealRoom       from "./pages/DealRoom";

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== "admin") return <Navigate to="/dashboard" />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<Landing />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/register"  element={<Register />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/admin"     element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/businesses" element={<PrivateRoute><Businesses /></PrivateRoute>} />
      <Route path="/valuations" element={<PrivateRoute><Valuations /></PrivateRoute>} />
      <Route path="/marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
      <Route path="/messages"   element={<PrivateRoute><Messages /></PrivateRoute>} />
      <Route path="/deal-room/:id" element={<PrivateRoute><DealRoom /></PrivateRoute>} />
    </Routes>
  );
}