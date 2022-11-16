export interface IAuthType {
    user: {
        id: number;

        username: string;

        email: string;
    };

    accessToken: string;

    refreshToken: string;
}

export type AuthContextType = {
    auth: IAuthType;

    setAuth: (auth: IAuthType) => void;
};
