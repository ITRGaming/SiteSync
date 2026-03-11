import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        try {
            await api.patch("/users/me/password", {
                oldPassword,
                newPassword,
            });

            alert("Password changed successfully! Please log in again.");
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("isAdmin");
            navigate("/");
        } catch (err: any) {
            if (err.response?.data?.message && Array.isArray(err.response.data.message)) {
                setError(err.response.data.message.join(", "));
            } else {
                setError(err.response?.data?.message || "Error changing password");
            }
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Change Password Required</h2>
                <p className="text-sm text-gray-500 mb-6 text-center">
                    You must change your password before continuing.
                </p>

                <input
                    type="password"
                    placeholder="Current Password"
                    className="w-full p-2 border rounded mb-4"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="New Password"
                    className="w-full p-2 border rounded mb-4"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <p className="text-xs text-gray-400 mb-4">Min 8 chars, 1 uppercase, 1 lowercase, 1 number/special</p>

                <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full p-2 border rounded mb-4"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

                <button
                    onClick={handleChangePassword}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                    disabled={!oldPassword || !newPassword || !confirmPassword}
                >
                    Change Password & Continue
                </button>

                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("role");
                        localStorage.removeItem("isAdmin");
                        navigate("/");
                    }}
                    className="w-full mt-4 text-gray-500 text-sm hover:underline hover:text-gray-700"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
