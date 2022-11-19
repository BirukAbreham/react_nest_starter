export interface IAuthType {
    user: {
        id: number;

        username: string;

        email: string;
    };

    accessToken: string;
}

export type AuthContextType = {
    auth: IAuthType;

    setAuth: Function;
};
