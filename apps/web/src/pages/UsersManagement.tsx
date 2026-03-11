import { useEffect, useState } from "react";
import api from "../api/axios";
import { IconButton } from "@radix-ui/themes";
import { ArrowLeftIcon, Pencil1Icon, LockClosedIcon, CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";

export default function UsersManagement() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const currentUserRole = localStorage.getItem("role");

    // Create User State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createData, setCreateData] = useState({ fullName: "", email: "", password: "", role: "ENGINEER" });

    // Edit User State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);
    const [editData, setEditData] = useState({ fullName: "", email: "", role: "" });

    // Reset Password State
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetUser, setResetUser] = useState<any>(null);
    const [resetPassword, setResetPassword] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await api.get("/users");
            setUsers(res.data);
        } catch (err) {
            console.error(err);
            alert("Error fetching users");
        }
    };

    useEffect(() => {
        if (!isAdmin) {
            navigate("/dashboard");
        } else {
            fetchUsers();
        }
    }, [isAdmin, navigate]);

    const handleCreateUser = async () => {
        try {
            await api.post("/users", createData);
            setShowCreateModal(false);
            setCreateData({ fullName: "", email: "", password: "", role: "ENGINEER" });
            fetchUsers();
        } catch (err: any) {
            if (err.response?.data?.message && Array.isArray(err.response.data.message)) {
                alert(err.response.data.message.join(", "));
            } else {
                alert(err.response?.data?.message || "Error creating user");
            }
        }
    };

    const handleEditUser = async () => {
        try {
            if (editData.fullName !== editUser.fullName || editData.email !== editUser.email) {
                await api.patch(`/users/${editUser.id}`, { fullName: editData.fullName, email: editData.email });
            }
            if (editData.role !== editUser.role.name) {
                await api.patch(`/users/${editUser.id}/role`, { role: editData.role });
            }
            setShowEditModal(false);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || "Error updating user");
        }
    };

    const handleResetPassword = async () => {
        try {
            await api.patch(`/users/${resetUser.id}/reset-password`, { newPassword: resetPassword });
            setShowResetModal(false);
            setResetPassword("");
            alert("Password reset successfully. The user will be required to change it on their next login.");
        } catch (err: any) {
            if (err.response?.data?.message && Array.isArray(err.response.data.message)) {
                alert(err.response.data.message.join(", "));
            } else {
                alert(err.response?.data?.message || "Error resetting password");
            }
        }
    };

    const toggleStatus = async (user: any) => {
        try {
            if (user.isActive) {
                await api.patch(`/users/${user.id}/deactivate`);
            } else {
                await api.patch(`/users/${user.id}/activate`);
            }
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || "Error changing status");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <IconButton variant="soft" color="gray" onClick={() => navigate("/dashboard")}>
                        <ArrowLeftIcon />
                    </IconButton>
                    <h1 className="text-3xl font-bold">User Management</h1>
                </div>
                {currentUserRole === "SUPER_ADMIN" && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold"
                    >
                        + Create New User
                    </button>
                )}
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{u.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                        {u.role?.name || 'UNKNOWN'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`text-xs font-medium px-2.5 py-0.5 rounded ${u.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {u.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                    <IconButton
                                        variant="soft"
                                        color={u.isActive ? "red" : "green"}
                                        onClick={() => toggleStatus(u)}
                                        title={u.isActive ? "Deactivate" : "Activate"}
                                        disabled={currentUserRole === "ADMIN" && u.role?.name === "SUPER_ADMIN"}
                                    >
                                        {u.isActive ? <CrossCircledIcon /> : <CheckCircledIcon />}
                                    </IconButton>

                                    <IconButton
                                        variant="soft"
                                        color="blue"
                                        onClick={() => {
                                            setEditUser(u);
                                            setEditData({ fullName: u.fullName, email: u.email, role: u.role?.name });
                                            setShowEditModal(true);
                                        }}
                                        title="Edit User"
                                        disabled={currentUserRole === "ADMIN" && u.role?.name === "SUPER_ADMIN"}
                                    >
                                        <Pencil1Icon />
                                    </IconButton>

                                    <IconButton
                                        variant="soft"
                                        color="amber"
                                        onClick={() => {
                                            setResetUser(u);
                                            setShowResetModal(true);
                                        }}
                                        title="Reset Password"
                                        disabled={currentUserRole === "ADMIN" && u.role?.name === "SUPER_ADMIN"}
                                    >
                                        <LockClosedIcon />
                                    </IconButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <div className="p-8 text-center text-gray-500">No users found.</div>}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Create New User</h2>
                        <div className="space-y-3">
                            <input
                                placeholder="Full Name"
                                className="w-full border p-2 rounded"
                                value={createData.fullName}
                                onChange={(e) => setCreateData({ ...createData, fullName: e.target.value })}
                            />
                            <input
                                placeholder="Email Address"
                                className="w-full border p-2 rounded"
                                value={createData.email}
                                onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                            />
                            <select
                                className="w-full border p-2 rounded bg-white"
                                value={createData.role}
                                onChange={(e) => setCreateData({ ...createData, role: e.target.value })}
                            >
                                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="ENGINEER">ENGINEER</option>
                            </select>
                            <input
                                type="password"
                                placeholder="Initial Temporary Password"
                                className="w-full border p-2 rounded"
                                value={createData.password}
                                onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                            />
                            <p className="text-xs text-gray-400">Min 8 chars, 1 uppercase, 1 lowercase, 1 number/special</p>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button className="px-4 py-2 text-gray-600 rounded" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
                                onClick={handleCreateUser}
                                disabled={!createData.fullName || !createData.email || !createData.password}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Edit User</h2>
                        <div className="space-y-3">
                            <input
                                placeholder="Full Name"
                                className="w-full border p-2 rounded"
                                value={editData.fullName}
                                onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                            />
                            <input
                                placeholder="Email Address"
                                className="w-full border p-2 rounded"
                                value={editData.email}
                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            />
                            <select
                                className="w-full border p-2 rounded bg-white"
                                value={editData.role}
                                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                            >
                                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="ENGINEER">ENGINEER</option>
                            </select>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button className="px-4 py-2 text-gray-600 rounded" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                                onClick={handleEditUser}
                                disabled={!editData.fullName || !editData.email}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetModal && resetUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
                        <p className="text-sm text-gray-600 mb-4">Resetting password for <strong>{resetUser.fullName}</strong></p>
                        <div className="space-y-3">
                            <input
                                type="password"
                                placeholder="New Password"
                                className="w-full border p-2 rounded"
                                value={resetPassword}
                                onChange={(e) => setResetPassword(e.target.value)}
                            />
                            <p className="text-xs text-gray-400">Min 8 chars, 1 uppercase, 1 lowercase, 1 number/special</p>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button className="px-4 py-2 text-gray-600 rounded" onClick={() => setShowResetModal(false)}>Cancel</button>
                            <button
                                className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 disabled:bg-amber-300"
                                onClick={handleResetPassword}
                                disabled={!resetPassword}
                            >
                                Reset Password
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
