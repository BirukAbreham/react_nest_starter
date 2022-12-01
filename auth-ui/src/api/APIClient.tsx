import axios from "axios";

export const APIClient = axios.create({
    baseURL: "http://localhost:5050/api",
    withCredentials: false,
});
