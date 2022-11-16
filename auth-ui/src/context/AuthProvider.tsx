import { createContext, useState } from "react";
import { AuthContextType, IAuthType } from "../types";

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
    const [auth, setAuth] = useState<IAuthType>({
        user: {
            id: 0,
            username: "",
            email: "",
        },
        accessToken: "",
        refreshToken: "",
    });

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
