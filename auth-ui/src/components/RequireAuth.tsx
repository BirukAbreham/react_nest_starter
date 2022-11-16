import { useAuth } from "../hooks";
import { AuthContextType } from "../types";
import { useLocation, Navigate, Outlet } from "react-router-dom";

export const RequireAuth = () => {
    const { auth } = useAuth() as AuthContextType;

    const location = useLocation();

    return auth?.accessToken.length ? (
        <Outlet />
    ) : (
        <Navigate to="/sign_in" state={{ from: location }} replace />
    );
};
