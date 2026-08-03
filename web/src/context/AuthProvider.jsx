import { useState } from "react";
import { AuthContext } from "./AuthContext";

const normalizeUserRole = (user) => {
    if (!user) return null;
    return {
        ...user,
        role: user.role?.toString().toLowerCase() || user.Role?.toString().toLowerCase(),
    };
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return normalizeUserRole(storedUser ? JSON.parse(storedUser) : null);
    });

    const [token, setToken] = useState(
        localStorage.getItem("token") || null
    );

    const login = (data) => {
        const normalizedUser = normalizeUserRole(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(normalizedUser));
        setToken(data.token);
        setUser(normalizedUser);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
