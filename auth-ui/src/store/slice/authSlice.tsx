import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AuthClient } from "../../api";
import { RootState } from "../store";

export interface AuthState {
    user: {
        id: number | string | null;
        username: string | null;
        email: string | null;
    };
    accessToken: string | null;
}

const initialState: AuthState = {
    user: {
        id: null,
        username: null,
        email: null,
    },
    accessToken: null,
};

export const requestSignIn = createAsyncThunk(
    "user/requestSignIn",
    async (data: any) => {
        try {
            let response = await AuthClient.post("/sign_in", data, {
                withCredentials: true,
            });

            return { status: response.status, data: response.data };
        } catch (error) {
            return error;
        }
    }
);

export const requestSignedUser = createAsyncThunk(
    "user/requestSignedUser",
    async (username: string | null, thunkAPI: any) => {
        try {
            const token = thunkAPI.getState().authorizer.accessToken;

            let response = await AuthClient.get(`/user/${username}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return { status: response.status, data: response.data };
        } catch (error) {
            return error;
        }
    }
);

export const requestSignOut = createAsyncThunk(
    "user/requestSignOut",
    async (username: string | null, thunkAPI: any) => {
        try {
            const token = thunkAPI.getState().authorizer.accessToken;

            let response = await AuthClient.post("/sign_out", null, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return { status: response.status, data: response.data };
        } catch (error) {
            return error;
        }
    }
);

export const requestRefresh = createAsyncThunk(
    "user/requestRefresh",
    async () => {
        try {
            let response = await AuthClient.post("/refresh", null, {
                withCredentials: true,
            });

            return { status: response.status, data: response.data };
        } catch (error) {
            return error;
        }
    }
);

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(
                requestSignIn.fulfilled,
                (state: AuthState, action: any) => {
                    state.accessToken = action.payload.data.accessToken;
                }
            )
            .addCase(
                requestSignedUser.fulfilled,
                (state: AuthState, action: any) => {
                    const { id, username, email } = action.payload.data;

                    state.user = { id, username, email };
                }
            )
            .addCase(
                requestSignOut.fulfilled,
                (state: AuthState, action: any) => {
                    state.accessToken = null;

                    state.user = { id: null, username: null, email: null };
                }
            )
            .addCase(
                requestRefresh.fulfilled,
                (state: AuthState, action: any) => {
                    state.accessToken = action.payload.data.accessToken;
                }
            );
    },
});

export const selectUser = (state: RootState) => state.authorizer.user;

export const selectToken = (state: RootState) => state.authorizer.accessToken;

export const authReducer = authSlice.reducer;
