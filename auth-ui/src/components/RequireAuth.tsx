import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectToken, selectUser } from "../store";

export const RequireAuth = () => {
    // react route related
    const location = useLocation();

    // react redux store related
    const user = useSelector(selectUser);
    const token = useSelector(selectToken);

    const canPass: boolean =
        (token !== "" || token !== null) && Object.values(user).every((value) => (value !== "" || value !== null));

    return canPass ? (
        <Outlet />
    ) : (
        <Navigate to="/sign_in" state={{ from: location }} replace />
    );
};
