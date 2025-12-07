import { useAuth } from "../services/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

// https://dev.to/miracool/how-to-manage-user-authentication-with-react-js-3ic5

const PrivateRoute = () => {
    // const user = useAuth();
    // if (!user.token) return <Navigate to="/" />;
    const { user, token } = useAuth();

    if (!user || !token) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
};

export default PrivateRoute;