import { useEffect, useState } from "react";
import api from "../api/axios";
import {useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { IconButton } from "@radix-ui/themes";

export default function Profile() {
    const navigate = useNavigate();
    const [me, setMe] = useState<any>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editFullName, setEditFullName] = useState("");
    const [editEmail, setEditEmail] = useState("");

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchUserDetails = async () => {
        try {
            const res = await api.get("/users/me");
            setMe(res.data);
            setEditFullName(res.data.fullName);
            setEditEmail(res.data.email);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const handleUpdateProfile = async () => {
        setError("");
        setSuccess("");
        try {
            await api.patch("/users/me", {
                fullName: editFullName,
                email: editEmail,
            });
            setSuccess("Profile updated successfully!");
            setIsEditing(false);
            fetchUserDetails();
        } catch (err: any) {
            setError(err.response?.data?.message || "Error updating profile");
        }
    };

    const handleChangePassword = async () => {
        setError("");
        setSuccess("");
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        try {
            await api.patch("/users/me/password", {
                oldPassword,
                newPassword,
            });

            setSuccess("Password changed successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            if (err.response?.data?.message && Array.isArray(err.response.data.message)) {
                setError(err.response.data.message.join(", "));
            } else {
                setError(err.response?.data?.message || "Error changing password");
            }
        }
    };

    if (!me) return <div className="p-8">Loading profile...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <IconButton variant="soft" color="gray" onClick={() => navigate("/dashboard")}>
                        <ArrowLeftIcon />
                    </IconButton>
                    <h1 className="text-3xl font-bold">My Profile</h1>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-xl font-semibold">User Information</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                            >
                                Edit Info
                            </button>
                        ) : (
                            <div className="space-x-4">
                                <button
                                    onClick={handleUpdateProfile}
                                    className="text-green-600 hover:text-green-800 text-sm font-semibold"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditFullName(me.fullName);
                                        setEditEmail(me.email);
                                    }}
                                    className="text-gray-600 hover:text-gray-800 text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 font-semibold">Full Name</p>
                            {isEditing ? (
                                <input
                                    placeholder="Full Name"
                                    className="w-full p-1 border rounded mt-1"
                                    value={editFullName}
                                    onChange={(e) => setEditFullName(e.target.value)}
                                />
                            ) : (
                                <p className="text-lg">{me.fullName}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-semibold">Email Address</p>
                            {isEditing ? (
                                <input
                                    placeholder="Email Address"
                                    className="w-full p-1 border rounded mt-1"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                />
                            ) : (
                                <p className="text-lg">{me.email}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-semibold">Role</p>
                            <span className="inline-block mt-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                {me.role?.name || "UNKNOWN"}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-semibold">Account Status</p>
                            <span className={`inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded ${me.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {me.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                    {isEditing && error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    {isEditing && success && <p className="text-green-600 text-sm mt-4">{success}</p>}
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">Change Password</h2>

                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
                            <input
                                placeholder="Old Password"
                                type="password"
                                className="w-full p-2 border rounded"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                placeholder="New Password"
                                type="password"
                                className="w-full p-2 border rounded mb-1"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <p className="text-xs text-gray-400">Min 8 chars, 1 uppercase, 1 lowercase, 1 number/special</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input
                                placeholder="Confirm New Password"
                                type="password"
                                className="w-full p-2 border rounded"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        {!isEditing && error && <p className="text-red-500 text-sm">{error}</p>}
                        {!isEditing && success && <p className="text-green-600 text-sm">{success}</p>}

                        <button
                            onClick={handleChangePassword}
                            disabled={!oldPassword || !newPassword || !confirmPassword}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            Update Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
