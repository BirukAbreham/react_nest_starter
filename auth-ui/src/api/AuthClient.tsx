import axios from "axios";

export const AuthClient = axios.create({
    baseURL: "http://localhost:5050",
});
