import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";

export default function Profile() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "UNKNOWN";
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
      await api.patch("/users/me/password", { oldPassword, newPassword });
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

  const inputCls = "w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8B6914] bg-white outline-none text-sm";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2";

  if (!me) {
    return (
      <div className="flex bg-[#F5F0E8] min-h-screen">
        <Sidebar user={null} role={role} />
        <div className="flex-1 p-10 flex items-center justify-center pb-20">
          <p className="text-gray-400 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#F5F0E8] min-h-screen">
      <Sidebar user={me} role={role} />

      <div className="flex-1 p-6 md:p-10 w-full overflow-x-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm">
          <button onClick={() => navigate("/dashboard")} className="text-gray-500 hover:text-[#8B6914]">
            <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.842 3.135a.5.5 0 0 0-.684.024l-4.5 4.5a.5.5 0 0 0 0 .682l4.5 4.5a.5.5 0 0 0 .708-.706L4.707 8H13.5a.5.5 0 0 0 0-1H4.707l4.159-4.159a.5.5 0 0 0-.024-.706Z" fill="currentColor"/></svg>
          </button>
          <h1 className="font-outfit font-bold text-xl">Profile</h1>
        </div>

        {/* Header */}
        <div className="mb-10 pb-6 border-b border-[#E5DFD3] hidden md:block">
          <p className="text-[#8B6914] text-[10px] uppercase font-bold tracking-[0.2em] mb-3">Account Settings</p>
          <h1 className="font-outfit text-4xl font-extrabold tracking-tight text-[#1A1A1A]">My Profile</h1>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Avatar + Info Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${me.fullName}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="font-outfit text-2xl font-bold">{me.fullName}</h2>
                <div className="flex gap-2 mt-1.5">
                  <span className="bg-[#F5F0E8] text-[#8B6914] text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {me.role?.name || "UNKNOWN"}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${me.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {me.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">User Information</h3>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="text-[#8B6914] hover:text-[#72540f] text-xs font-bold uppercase tracking-wider transition-colors">
                  Edit
                </button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={handleUpdateProfile} className="text-green-600 hover:text-green-800 text-xs font-bold uppercase tracking-wider">
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditFullName(me.fullName);
                      setEditEmail(me.email);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Full Name</label>
                {isEditing ? (
                  <input className={inputCls} value={editFullName} onChange={(e) => setEditFullName(e.target.value)} />
                ) : (
                  <p className="text-sm font-semibold">{me.fullName}</p>
                )}
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                {isEditing ? (
                  <input className={inputCls} value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                ) : (
                  <p className="text-sm font-semibold">{me.email}</p>
                )}
              </div>
            </div>
            {isEditing && error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            {isEditing && success && <p className="text-green-600 text-sm mt-3">{success}</p>}
          </div>

          {/* Change Password Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-5 border-b border-gray-100 pb-3">Change Password</h3>

            <div className="space-y-4 max-w-md">
              <div>
                <label className={labelCls}>Old Password</label>
                <input type="password" placeholder="Current password" className={inputCls} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>New Password</label>
                <input type="password" placeholder="New password" className={inputCls} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <p className="text-[10px] text-gray-400 mt-1">Min 8 chars, 1 uppercase, 1 lowercase, 1 number/special</p>
              </div>
              <div>
                <label className={labelCls}>Confirm New Password</label>
                <input type="password" placeholder="Confirm new password" className={inputCls} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>

              {!isEditing && error && <p className="text-red-500 text-sm">{error}</p>}
              {!isEditing && success && <p className="text-green-600 text-sm">{success}</p>}

              <button
                onClick={handleChangePassword}
                disabled={!oldPassword || !newPassword || !confirmPassword}
                className="px-6 py-3 bg-[#8B6914] hover:bg-[#72540f] text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-40 uppercase tracking-wider"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
