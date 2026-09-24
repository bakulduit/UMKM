import { Navigate, useLocation } from "react-router-dom";
import { useAuth, homeFor } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (roles && !roles.includes(user.role))
    return <Navigate to={homeFor(user.role)} replace />;

  return children;
}
