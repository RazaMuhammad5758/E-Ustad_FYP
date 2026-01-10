import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // JWT cookie
});
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // ✅ Optional: just return rejected without console spam
      // yahan tum redirect bhi kar sakte ho if needed
    }
    return Promise.reject(err);
  }
);
export default api;
