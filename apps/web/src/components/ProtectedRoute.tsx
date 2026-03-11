import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.mustChangePassword && location.pathname !== "/change-password") {
      return <Navigate to="/change-password" replace />;
    }
  } catch (e) {
    // If token parsing fails, force login
    localStorage.removeItem("token");
    return <Navigate to="/" />;
  }

  return children;
}
