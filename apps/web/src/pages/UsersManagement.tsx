import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import { Cross2Icon } from "@radix-ui/react-icons";

export default function UsersManagement() {
    const navigate = useNavigate();
    const [me, setMe] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const role = localStorage.getItem("role") || "UNKNOWN";

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

    const fetchMe = async () => {
        try {
            const res = await api.get("/users/me");
            setMe(res.data);
        } catch (err) {
            console.error(err);
        }
    };

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
            fetchMe();
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
            alert("Password reset successfully.");
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

    const inputCls = "w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8B6914] bg-white outline-none text-sm";
    const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2";

    // Modal wrapper
    const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-slideUp p-6">{children}</div>
        </div>
    );

    return (
        <div className="flex bg-[#F5F0E8] min-h-screen">
            <Sidebar user={me} role={role} />

            <div className="flex-1 p-6 md:p-10 w-full overflow-x-hidden pb-20">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm">
                    <button onClick={() => navigate("/dashboard")} className="text-gray-500 hover:text-[#8B6914]">
                        <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.842 3.135a.5.5 0 0 0-.684.024l-4.5 4.5a.5.5 0 0 0 0 .682l4.5 4.5a.5.5 0 0 0 .708-.706L4.707 8H13.5a.5.5 0 0 0 0-1H4.707l4.159-4.159a.5.5 0 0 0-.024-.706Z" fill="currentColor" /></svg>
                    </button>
                    <h1 className="font-outfit font-bold text-xl">User Management</h1>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b border-[#E5DFD3] hidden md:flex">
                    <div>
                        <p className="text-[#8B6914] text-[10px] uppercase font-bold tracking-[0.2em] mb-3">Administration</p>
                        <h1 className="font-outfit text-4xl font-extrabold tracking-tight text-[#1A1A1A]">User Management</h1>
                    </div>
                    {role === "SUPER_ADMIN" && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-[#8B6914] hover:bg-[#72540f] text-white rounded-lg font-bold text-sm transition-colors uppercase tracking-wider"
                        >
                            + Create User
                        </button>
                    )}
                </div>

                {/* Mobile create button */}
                {role === "SUPER_ADMIN" && (
                    <div className="md:hidden mb-4">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="w-full px-6 py-3 bg-[#8B6914] hover:bg-[#72540f] text-white rounded-lg font-bold text-sm transition-colors uppercase tracking-wider"
                        >
                            + Create User
                        </button>
                    </div>
                )}

                {/* Users List — cards on mobile, table on desktop */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden hidden md:block">
                    <table className="min-w-full text-left">
                        <thead className="bg-[#F5F0E8] border-b border-[#E5DFD3]">
                            <tr>
                                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${u.fullName}`} alt="" className="w-full h-full" />
                                            </div>
                                            <span className="font-semibold text-sm">{u.fullName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="bg-[#F5F0E8] text-[#8B6914] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                            {u.role?.name || "UNKNOWN"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${u.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                            {u.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex gap-1.5 justify-end">
                                            <button
                                                onClick={() => toggleStatus(u)}
                                                disabled={role === "ADMIN" && u.role?.name === "SUPER_ADMIN"}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-30 ${u.isActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"
                                                    }`}
                                            >
                                                {u.isActive ? "Deactivate" : "Activate"}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditUser(u);
                                                    setEditData({ fullName: u.fullName, email: u.email, role: u.role?.name });
                                                    setShowEditModal(true);
                                                }}
                                                disabled={role === "ADMIN" && u.role?.name === "SUPER_ADMIN"}
                                                className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#F5F0E8] text-[#8B6914] hover:bg-[#E5DFD3] transition-colors disabled:opacity-30"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setResetUser(u);
                                                    setShowResetModal(true);
                                                }}
                                                disabled={role === "ADMIN" && u.role?.name === "SUPER_ADMIN"}
                                                className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-30"
                                            >
                                                Reset PW
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && <div className="p-8 text-center text-gray-400 font-medium">No users found.</div>}
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-4">
                    {users.map((u) => (
                        <div key={u.id} className="bg-white rounded-xl shadow-sm p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${u.fullName}`} alt="" className="w-full h-full" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{u.fullName}</p>
                                    <p className="text-xs text-gray-500">{u.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mb-3">
                                <span className="bg-[#F5F0E8] text-[#8B6914] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    {u.role?.name || "UNKNOWN"}
                                </span>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${u.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                    {u.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleStatus(u)}
                                    disabled={role === "ADMIN" && u.role?.name === "SUPER_ADMIN"}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-30 ${u.isActive ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                                        }`}
                                >
                                    {u.isActive ? "Deactivate" : "Activate"}
                                </button>
                                <button
                                    onClick={() => {
                                        setEditUser(u);
                                        setEditData({ fullName: u.fullName, email: u.email, role: u.role?.name });
                                        setShowEditModal(true);
                                    }}
                                    disabled={role === "ADMIN" && u.role?.name === "SUPER_ADMIN"}
                                    className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#F5F0E8] text-[#8B6914] disabled:opacity-30"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        setResetUser(u);
                                        setShowResetModal(true);
                                    }}
                                    disabled={role === "ADMIN" && u.role?.name === "SUPER_ADMIN"}
                                    className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 disabled:opacity-30"
                                >
                                    Reset PW
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <Modal onClose={() => setShowCreateModal(false)}>
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="font-outfit text-xl font-bold">Create New User</h3>
                        <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600"><Cross2Icon /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className={labelCls}>Full Name</label>
                            <input className={inputCls} placeholder="Full Name" value={createData.fullName} onChange={(e) => setCreateData({ ...createData, fullName: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelCls}>Email Address</label>
                            <input className={inputCls} placeholder="Email Address" value={createData.email} onChange={(e) => setCreateData({ ...createData, email: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelCls}>Role</label>
                            <select className={inputCls} value={createData.role} onChange={(e) => setCreateData({ ...createData, role: e.target.value })}>
                                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="ENGINEER">ENGINEER</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Initial Password</label>
                            <input type="password" className={inputCls} placeholder="Temporary Password" value={createData.password} onChange={(e) => setCreateData({ ...createData, password: e.target.value })} />
                            <p className="text-[10px] text-gray-400 mt-1">Min 8 chars, 1 uppercase, 1 lowercase, 1 number/special</p>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                        <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-500 text-sm font-semibold">Cancel</button>
                        <button onClick={handleCreateUser} disabled={!createData.fullName || !createData.email || !createData.password} className="px-6 py-2 bg-[#8B6914] hover:bg-[#72540f] text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-40">
                            Create
                        </button>
                    </div>
                </Modal>
            )}

            {/* Edit Modal */}
            {showEditModal && editUser && (
                <Modal onClose={() => setShowEditModal(false)}>
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="font-outfit text-xl font-bold">Edit User</h3>
                        <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600"><Cross2Icon /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className={labelCls}>Full Name</label>
                            <input className={inputCls} value={editData.fullName} onChange={(e) => setEditData({ ...editData, fullName: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelCls}>Email Address</label>
                            <input className={inputCls} value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelCls}>Role</label>
                            <select className={inputCls} value={editData.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })}>
                                <option disabled={role === "ADMIN"} value="SUPER_ADMIN">SUPER_ADMIN</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="ENGINEER">ENGINEER</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                        <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-500 text-sm font-semibold">Cancel</button>
                        <button onClick={handleEditUser} disabled={!editData.fullName || !editData.email} className="px-6 py-2 bg-[#8B6914] hover:bg-[#72540f] text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-40">
                            Save Changes
                        </button>
                    </div>
                </Modal>
            )}

            {/* Reset Password Modal */}
            {showResetModal && resetUser && (
                <Modal onClose={() => setShowResetModal(false)}>
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="font-outfit text-xl font-bold">Reset Password</h3>
                        <button onClick={() => setShowResetModal(false)} className="text-gray-400 hover:text-gray-600"><Cross2Icon /></button>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Resetting password for <strong>{resetUser.fullName}</strong></p>
                    <div>
                        <label className={labelCls}>New Password</label>
                        <input type="password" className={inputCls} placeholder="New Password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} />
                        <p className="text-[10px] text-gray-400 mt-1">Min 8 chars, 1 uppercase, 1 lowercase, 1 number/special</p>
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                        <button onClick={() => setShowResetModal(false)} className="px-4 py-2 text-gray-500 text-sm font-semibold">Cancel</button>
                        <button onClick={handleResetPassword} disabled={!resetPassword} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-40">
                            Reset Password
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
