import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";

export default function ProtectedRoute({ children }) {
    const { isAdmin, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center secondary-font text-[#B5A79B]"
                style={{ background: "linear-gradient(160deg, #FFF8F3 0%, #FFF3EA 100%)" }}
            >
                در حال بارگذاری...
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <Navigate
                to="/Marketing-Website/admin/login"
                state={{ from: location }}
                replace
            />
        );
    }

    return children;
}