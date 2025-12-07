import { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [token, setToken] = useState(localStorage.getItem("site") || "");
    const navigate = useNavigate();

    const loginAction = async (data) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/login`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const res = response.data;
            // console.log("Login response:", res);

            if (res.error) {
                alert(res.error);
                return;
            }

            if (res.token && res.userType && res.username && res.userID) {
                const { token, userType, username, userID, defaultBranchID, branchName, branchLocation } = res;
                // console.log("Login response data:", { token, userType, username, userID, defaultBranchID, branchName, branchLocation });
                const userData = { username, userType, userID, defaultBranchID, branchName, branchLocation };
                setUser(userData);
                setToken(token);
                localStorage.setItem("site", token);
                localStorage.setItem("user", JSON.stringify(userData));

                if (userType === 'owner') {
                    // console.log("Navigating to admin-dashboard for user:", username);
                    navigate(`/admin-dashboard/${username}`);
                    // console.log("Navigation attempted to:", `/admin-dashboard/${username}`);
                } else if (userType === 'employee') {
                    navigate(`/employee-dashboard/${username}`);
                }
                return;
            }
            throw new Error(res.message);
        } catch (err) {
            if (err.response) {
                if (err.response.status === 403 || err.response.status === 404 || err.response.status === 401) {
                    alert(err.response.data.error);
                } else {
                    console.error(err);
                }
            } else {
                console.error(err);
            }
        }
    };

    const logOut = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/logout/${user?.userID}`, {
                username: user?.username
            });
        } catch (error) {
            console.error("Logout error:", error);
        }

        setUser(null);
        setToken("");
        localStorage.removeItem("site");
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <AuthContext.Provider value={{
            token, user, loginAction, logOut
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

export const useAuth = () => {
    return useContext(AuthContext);
};