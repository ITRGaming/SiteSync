import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import ProjectCard from "../components/dashboard/projectCard";
import OnboardCard from "../components/dashboard/OnboardCard";
import CreateSiteModal from "../components/dashboard/CreateSiteModal";
import { Cross2Icon } from "@radix-ui/react-icons";

function Dashboard() {
  const [me, setMe] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  // Assign modal
  const [assignModalSiteId, setAssignModalSiteId] = useState<number | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "UNKNOWN";
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const fetchUserDetails = async () => {
    try {
      const res = await api.get("/users/me");
      setMe(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await api.get(`/sites?isActive=${activeTab === "active"}`);
      setSites(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssignableUsers = async () => {
    try {
      const res = await api.get("/users/assignable");
      setAssignableUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchSites();
    fetchAssignableUsers();
  }, [activeTab]);

  // Assign modal handlers
  const openAssignModal = (siteId: number) => {
    setAssignModalSiteId(siteId);
    setSelectedUserIds([]);
  };

  const assignUsers = async () => {
    if (!assignModalSiteId || selectedUserIds.length === 0) return;
    const errors: string[] = [];
    for (const userId of selectedUserIds) {
      try {
        await api.post(`/sites/${assignModalSiteId}/assign/${userId}`);
      } catch (err: any) {
        errors.push(err.response?.data?.message || "Error assigning");
      }
    }
    if (errors.length > 0) alert(errors.join("\n"));
    setAssignModalSiteId(null);
    fetchSites();
  };

  const unassignUser = async (siteId: number, userId: number) => {
    if (!window.confirm("Remove this engineer from the site?")) return;
    try {
      await api.delete(`/sites/${siteId}/assign/${userId}`);
      fetchSites();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error unassigning");
    }
  };

  const softDeleteSite = async (id: number) => {
    if (!window.confirm("Archive this site?")) return;
    await api.patch(`/sites/${id}/delete`);
    fetchSites();
  };

  const restoreSite = async (id: number) => {
    await api.patch(`/sites/${id}/restore`);
    fetchSites();
  };

  const hardDeleteSite = async (id: number) => {
    if (!window.confirm("Permanently delete this site? This cannot be undone.")) return;
    await api.delete(`/sites/${id}`);
    fetchSites();
  };

  const activeSitesCount = sites.filter((s) => s.isActive).length;
  const inactiveSitesCount = activeTab === "deleted" ? sites.length : 0;

  // Get site for assign modal
  const assignModalSite = sites.find((s) => s.id === assignModalSiteId);
  const alreadyAssignedIds = assignModalSite?.assignments?.map((a: any) => a.user?.id) || [];
  const filteredAssignableUsers = assignableUsers.filter((u) => !alreadyAssignedIds.includes(u.id));

  return (
    <div className="flex bg-[#F5F0E8] min-h-screen">
      <Sidebar user={me} role={role} />

      <div className="flex-1 p-6 md:p-10 w-full overflow-x-hidden pb-20">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#8B6914] rounded-md flex items-center justify-center text-white font-bold font-outfit">S</div>
            <h1 className="font-outfit font-bold text-xl leading-none">SiteSync</h1>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-gray-100 p-2 rounded-lg"
              onClick={() => navigate("/profile")}
            >
              <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${me?.fullName || "User"}`}
                alt="Avatar"
                className="w-6 h-6 rounded-full"
              />
            </button>
            <button
              className="bg-[#8B6914] text-white p-2 flex items-center justify-center rounded-lg"
              onClick={() => setCreateModalOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 1V14M1 7.5H14" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b border-[#E5DFD3]">
          <div>
            <p className="text-[#8B6914] text-[10px] uppercase font-bold tracking-[0.2em] mb-3">Operational Matrix</p>
            <h1 className="font-outfit text-4xl md:text-5xl font-extrabold tracking-tight text-[#1A1A1A]">
              Project Ledger <span className="text-[#8B6914]">Overview</span>
            </h1>
          </div>
          <div className="flex gap-8 mt-6 md:mt-0 text-right">
            <div>
              <p className="text-4xl md:text-5xl font-outfit font-bold text-[#1A1A1A] leading-none mb-1">
                {String(activeTab === "active" ? activeSitesCount : sites.length).padStart(2, "0")}
              </p>
              <p className="text-[10px] font-bold tracking-wider uppercase text-gray-500">
                {activeTab === "active" ? "ACTIVE SITES" : "DELETED"}
              </p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-outfit font-bold text-gray-300 leading-none mb-1">
                {String(inactiveSitesCount).padStart(2, "0")}
              </p>
              <p className="text-[10px] font-bold tracking-wider uppercase text-gray-400">INACTIVE</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all shadow-sm whitespace-nowrap ${
              activeTab === "active" ? "bg-[#8B6914] text-white" : "bg-white text-gray-500 hover:bg-gray-100"
            }`}
          >
            Active Sites
          </button>
          <button
            onClick={() => setActiveTab("deleted")}
            className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all shadow-sm whitespace-nowrap ${
              activeTab === "deleted" ? "bg-[#8B6914] text-white" : "bg-white text-gray-500 hover:bg-gray-100"
            }`}
          >
            Deleted
          </button>
          <button
            className="px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all shadow-sm bg-white text-gray-500 hover:bg-gray-100 whitespace-nowrap hidden md:block"
            onClick={() => setCreateModalOpen(true)}
          >
            + New Project
          </button>
          <button
            className="px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all shadow-sm bg-white text-gray-500 hover:bg-gray-100 whitespace-nowrap ml-auto"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              localStorage.removeItem("isAdmin");
              window.location.href = "/";
            }}
          >
            Sign Out
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideUp">
          {sites.map((site) => (
            <ProjectCard
              key={site.id}
              site={site}
              isAdmin={isAdmin}
              activeTab={activeTab}
              role={role}
              onAssign={openAssignModal}
              onUnassign={unassignUser}
              onSoftDelete={softDeleteSite}
              onRestore={restoreSite}
              onHardDelete={hardDeleteSite}
            />
          ))}
          {activeTab === "active" && <OnboardCard onClick={() => setCreateModalOpen(true)} />}
        </div>
      </div>

      {/* Assign Modal */}
      {assignModalSiteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAssignModalSiteId(null)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-slideUp">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-outfit text-xl font-bold">Assign Engineers</h3>
                <button onClick={() => setAssignModalSiteId(null)} className="text-gray-400 hover:text-gray-600">
                  <Cross2Icon />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Assigning to <strong>{assignModalSite?.name}</strong>
              </p>

              {filteredAssignableUsers.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">All eligible engineers are already assigned.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredAssignableUsers.map((user) => (
                    <label key={user.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[#8B6914] rounded"
                        checked={selectedUserIds.includes(user.id.toString())}
                        onChange={() => {
                          setSelectedUserIds((prev) =>
                            prev.includes(user.id.toString()) ? prev.filter((id) => id !== user.id.toString()) : [...prev, user.id.toString()]
                          );
                        }}
                      />
                      <span className="font-medium text-sm">{user.fullName}</span>
                    </label>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setAssignModalSiteId(null)} className="px-4 py-2 text-gray-500 text-sm font-semibold">
                  Cancel
                </button>
                <button
                  onClick={assignUsers}
                  disabled={selectedUserIds.length === 0}
                  className="px-6 py-2 bg-[#8B6914] hover:bg-[#72540f] text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-40"
                >
                  Assign Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateSiteModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={fetchSites} assignableUsers={assignableUsers} />
    </div>
  );
}

export default Dashboard;