import { AxiosRequestConfig, AxiosResponse } from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APIClient } from "../api";
import { requestRefresh, selectToken, useAppDispatch } from "../store";

export const useAPIClient = () => {
    // react router related
    const navigate = useNavigate();

    // react redux store related
    const dispatch = useAppDispatch();
    const token = useSelector(selectToken);

    const APIRequestIntercept = APIClient.interceptors.request.use(
        (config: AxiosRequestConfig) => {
            // Do something before request is sent
            if (
                config?.headers !== undefined &&
                (token !== "" || token !== null)
            ) {
                if (config.headers !== undefined) {
                    config.headers["Authorization"] = `Bearer ${token}`;
                }
            }

            return config;
        },
        (error) => {
            // Do something with request error
            return Promise.reject(error);
        }
    );

    const APIResponseIntercept = APIClient.interceptors.response.use(
        (response: AxiosResponse<any, any>) => {
            // Any status codes that fails outside the range of 2xx cause this function to trigger
            // Do something with response error
            return response;
        },
        async (error) => {
            // Any status codes that falls outside the range of 2xx cause this function to trigger
            // Do something with response error
            if (error?.response && (token !== "" || token !== null)) {
                const prevRequest = error?.config;

                if (error?.response.status === 401 && !prevRequest?.sent) {
                    // refresh the access token and set the auth store state
                    // dispatch refresh async action and it will set the new token
                    const response: any = await dispatch(
                        requestRefresh()
                    ).unwrap();

                    // start to resend the previous failed request
                    prevRequest.sent = true;

                    // set the prevRequest headers
                    prevRequest.headers = { ...prevRequest.headers };

                    prevRequest.headers[
                        "Authorization"
                    ] = `Bearer ${response.data.accessToken}`;

                    // return the previous request
                    return APIClient({
                        ...prevRequest,
                        ...{ headers: JSON.stringify(prevRequest.headers) },
                    });
                } else if (error?.response.status === 403) {
                    // navigate the user to sign in page
                    navigate("/sign_in", { replace: true });
                    return;
                } else {
                    return Promise.reject(error);
                }
            } else {
                return Promise.reject(error);
            }
        }
    );

    return APIClient;
};
