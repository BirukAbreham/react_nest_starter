import { AuthClient } from "../api";
import { AuthContextType } from "../types";
import { useAuth } from "./useAuth";

export const useRefresh = () => {
    const { setAuth } = useAuth() as AuthContextType;

    async function refresh() {
        try {
            const response = await AuthClient.post(
                "/api/auth/refresh",
                {},
                { withCredentials: true }
            );

            if (response.status === 200) console.log("Refresh token success");

            const { accessToken } = response.data;

            setAuth((prevAuthState: any) => ({
                ...prevAuthState,
                accessToken,
            }));

            return accessToken;
        } catch (error) {
            Promise.reject(error);
        }
    }

    return refresh;
};
