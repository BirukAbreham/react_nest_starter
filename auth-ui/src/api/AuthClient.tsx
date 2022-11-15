import axios from "axios";

export const AuthClient = (() => {
    return axios.create({
        baseURL: "http://localhost:5050",
    });
})();
