import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            const res = await api.post("/auth/login",
                {
                    email, 
                    password,
                }
            );

            const token = res.data.access_token;
            localStorage.setItem("token", token);
            const payload = JSON.parse(atob(token.split(".")[1]));
            const role = payload?.role || "UNKNOWN";
            console.log("User role:", role);
            const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
            localStorage.setItem("role", role);
            localStorage.setItem("isAdmin", isAdmin.toString());

            navigate("/dashboard");
        } catch (err) {
            setError("Invalid credentials");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Site Management Login
                </h2>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 border rounded mb-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 border rounded mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                    <p className="text-red-500 mb-4">{error}</p>
                )}

                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                    Login
                </button>
            </div>
        </div>
    );
}