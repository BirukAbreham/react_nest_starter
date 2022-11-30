import { AxiosRequestConfig, AxiosResponse } from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ApiClient } from "../api";
import { AuthContextType } from "../types";
import { useAuth } from "./useAuth";
import { useRefresh } from "./useRefresh";

export const useApiClient = () => {
    const navigate = useNavigate();

    const refresh = useRefresh();

    const { auth, setAuth } = useAuth() as AuthContextType;

    useEffect(() => {
        const ApiRequestIntercept = ApiClient.interceptors.request.use(
            (config: AxiosRequestConfig<any>) => {
                // Do something before request is sent
                if (config?.headers !== undefined && auth.accessToken !== "") {
                    console.log("I was here");
                    if (config.headers !== undefined) {
                        config.headers[
                            "Authorization"
                        ] = `Bearer ${auth.accessToken}`;
                    }
                }

                return config;
            },
            (error) => {
                // Do something with request error
                return Promise.reject(error);
            },
        );

        const ApiResponseIntercept = ApiClient.interceptors.response.use(
            (response: AxiosResponse<any, any>) => {
                // Any status code that lie within the range of 2xx cause this function to trigger
                // Do something with response data
                return response;
            },
            async (error) => {
                // Any status codes that falls outside the range of 2xx cause this function to trigger
                // Do something with response error
                if (error?.response && auth.accessToken !== "") {
                    const prevRequest = error?.config;

                    if (error?.response.status === 401 && !prevRequest?.sent) {
                        // refresh the access token and set auth context
                        console.log("Caught unauthorized");

                        prevRequest.sent = true;

                        const accessToken = await refresh();

                        prevRequest.headers[
                            "Authorization"
                        ] = `Bearer ${accessToken}`;

                        setAuth((prevAuthState: any) => ({
                            ...prevAuthState,
                            accessToken,
                        }));

                        return ApiClient(prevRequest);
                    } else if (error?.response.status === 403) {
                        // navigate the user to sign in page
                        navigate("/sign_in", { replace: true });
                        return;
                    } else {
                        return Promise.reject(error);
                    }
                }
                return Promise.reject(error);
            },
        );

        return () => {
            ApiClient.interceptors.request.eject(ApiRequestIntercept);

            ApiClient.interceptors.response.eject(ApiResponseIntercept);
        };
    }, []);

    return ApiClient;
};
