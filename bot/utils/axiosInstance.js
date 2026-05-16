import axios from "axios";

const { baseURL } = process.env
const axiosInstance = axios.create({
    baseURL,
})

export default axiosInstance